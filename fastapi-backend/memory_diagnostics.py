import asyncio
import os
import sys
import time
from io import BytesIO
from pathlib import Path

from PIL import Image

from apps.certificates.services.background_removal import remove_background_from_image
from apps.certificates.services.pdf_generator import html_to_pdf


def _rss_mb() -> float:
    try:
        import psutil
        return psutil.Process().memory_info().rss / (1024 * 1024)
    except Exception:
        return 0.0


async def _bench_background_removal() -> None:
    img = Image.new("RGBA", (1200, 900), (255, 255, 255, 0))
    buf = BytesIO()
    img.save(buf, format="PNG")
    payload = buf.getvalue()

    for count in (1, 5, 10):
        before = _rss_mb()
        start = time.perf_counter()
        for _ in range(count):
            await remove_background_from_image(payload, output_format="PNG")
        after = _rss_mb()
        print(f"background_removal count={count} rss_before_mb={before:.2f} rss_after_mb={after:.2f} duration_ms={((time.perf_counter() - start) * 1000):.0f}")


async def _bench_pdf_generation() -> None:
    html = "<html><body><h1>Memory Diagnostic</h1><p>PDF</p></body></html>"
    for count in (1, 5, 10, 25):
        before = _rss_mb()
        start = time.perf_counter()
        for _ in range(count):
            await html_to_pdf(html)
        after = _rss_mb()
        print(f"pdf_generation count={count} rss_before_mb={before:.2f} rss_after_mb={after:.2f} duration_ms={((time.perf_counter() - start) * 1000):.0f}")


async def main() -> None:
    print("memory diagnostic started")
    await _bench_background_removal()
    await _bench_pdf_generation()
    print("memory diagnostic finished")


if __name__ == "__main__":
    asyncio.run(main())
