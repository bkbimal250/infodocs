import asyncio
import os
import sys
import tempfile
import time
import unittest
from concurrent.futures import ProcessPoolExecutor
from unittest.mock import patch

from apps.certificates.services.background_removal import (
    CrossProcessJobLock,
    RembgBusyError,
    RembgTimeoutError,
    RembgUnavailableError,
    _execute_job_with_lock,
)

def _worker_attempt_lock(lock_path: str, hold_duration: float) -> str:
    """Helper run in separate process to test cross-process lock contention."""
    lock = CrossProcessJobLock(lock_path)
    if lock.acquire():
        try:
            time.sleep(hold_duration)
            return "acquired"
        finally:
            lock.release()
    else:
        return "busy"


def _hanging_child(conn, image_data, output_format):
    """Simulates a hanging inference process."""
    time.sleep(30)


def _crashing_child(conn, image_data, output_format):
    """Simulates an abrupt OOM kill or crash in the child process."""
    os._exit(42)


class TestConcurrencyAndLifecycle(unittest.TestCase):
    def setUp(self):
        self.lock_file = os.path.join(tempfile.gettempdir(), f"lifecycle_test_{os.getpid()}_{time.time_ns()}.lock")

    def tearDown(self):
        try:
            if os.path.exists(self.lock_file):
                os.remove(self.lock_file)
        except Exception:
            pass

    def test_cross_process_mutual_exclusion(self):
        """Simulate two separate Gunicorn worker processes contending for the inference lock."""
        with ProcessPoolExecutor(max_workers=2) as executor:
            # First worker acquires and holds lock for 0.8 seconds
            f1 = executor.submit(_worker_attempt_lock, self.lock_file, 0.8)
            time.sleep(0.15)  # Ensure worker 1 has acquired lock
            # Second worker attempts to acquire immediately
            f2 = executor.submit(_worker_attempt_lock, self.lock_file, 0.1)

            res1 = f1.result(timeout=5)
            res2 = f2.result(timeout=5)

            self.assertEqual(res1, "acquired")
            self.assertEqual(res2, "busy")

    def test_lock_released_after_job_completion(self):
        """Confirm that once a job finishes or releases, a subsequent job can acquire the lock immediately."""
        lock = CrossProcessJobLock(self.lock_file)
        self.assertTrue(lock.acquire())
        lock.release()

        # Second lock attempt must succeed immediately
        lock2 = CrossProcessJobLock(self.lock_file)
        self.assertTrue(lock2.acquire())
        lock2.release()

    @patch("apps.certificates.services.background_removal._child_inference_worker", _hanging_child)
    def test_child_timeout_reaped_and_lock_released(self):
        """Confirm that a timed-out child process is killed and the lock is released."""
        with self.assertRaises(RembgTimeoutError):
            _execute_job_with_lock(
                image_data=b"fake-bytes",
                output_format="PNG",
                timeout_s=0.5,
                lock_path=self.lock_file,
            )

        # Confirm lock was cleanly released despite timeout
        subsequent_lock = CrossProcessJobLock(self.lock_file)
        self.assertTrue(subsequent_lock.acquire())
        subsequent_lock.release()

    @patch("apps.certificates.services.background_removal._child_inference_worker", _crashing_child)
    def test_child_crash_detected_and_lock_released(self):
        """Confirm that an abruptly crashed child process raises RembgUnavailableError and lock is released."""
        with self.assertRaises(RembgUnavailableError) as ctx:
            _execute_job_with_lock(
                image_data=b"fake-bytes",
                output_format="PNG",
                timeout_s=5.0,
                lock_path=self.lock_file,
            )
        self.assertIn("crashed or was terminated", str(ctx.exception))

        # Confirm lock was cleanly released despite abrupt process death
        subsequent_lock = CrossProcessJobLock(self.lock_file)
        self.assertTrue(subsequent_lock.acquire())
        subsequent_lock.release()


if __name__ == "__main__":
    unittest.main()
