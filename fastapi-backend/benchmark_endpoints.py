import asyncio
import httpx
import time
import statistics
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = "/api"

# Admin credentials provided by user
USER_EMAIL = "dos.bimal@gmail.com"
USER_PASSWORD = "Dos@2025"

ENDPOINTS = [
    {"name": "Queries List", "url": "/queries/", "params": {"skip": 0, "limit": 10}},
    {"name": "Staff List (Paginated)", "url": "/staff/", "params": {"skip": 0, "limit": 10}},
    {"name": "Analytics Overview", "url": "/analytics"},
    {"name": "Consolidated Analytics", "url": "/analytics/overview"},
    {"name": "Staff Stats (Consolidated)", "url": "/staff/analytics/consolidated"},
]

async def authenticate(client):
    """Authenticate and update client cookies"""
    print(f"Authenticating as {USER_EMAIL}...")
    login_url = f"{API_PREFIX}/users/auth/login"
    try:
        response = await client.post(
            login_url, 
            json={"email": USER_EMAIL, "password": USER_PASSWORD}
        )
        if response.status_code == 200:
            print("  [SUCCESS] Authentication successful")
            # Log cookies to verify they are captured
            if response.cookies:
                print(f"  [DEBUG] Captured cookies: {list(response.cookies.keys())}")
            client.cookies.update(response.cookies)
            return True
        else:
            print(f"  [FAILED] Authentication failed: {response.status_code}")
            print(f"  Detail: {response.text}")
            return False
    except Exception as e:
        print(f"  [ERROR] Authentication error: {e}")
        return False

async def benchmark_endpoint(client, name, url, params=None):
    latencies = []
    print(f"Testing {name} ({url})...")
    
    # Pre-pend API_PREFIX if not present
    full_url = url if url.startswith("http") else f"{API_PREFIX}{url}"
    
    for i in range(5):  # 5 samples per endpoint
        start_time = time.perf_counter()
        try:
            response = await client.get(full_url, params=params)
            latency = (time.perf_counter() - start_time) * 1000  # ms
            if response.status_code == 200:
                latencies.append(latency)
            elif response.status_code == 401:
                print(f"  [Error] {name} [{i+1}/5]: Unauthorized (401)")
                # Print cookies being sent
                # print(f"  [DEBUG] Cookies sent: {client.cookies}")
                break
            else:
                print(f"  [Error] {name} [{i+1}/5]: Status {response.status_code}")
        except Exception as e:
            print(f"  [Error] {name} [{i+1}/5]: {e}")
            
    if latencies:
        avg = statistics.mean(latencies)
        p95 = max(latencies) # p95 with only 5 samples is just max
        print(f"  Average: {avg:.2f}ms | Max: {max(latencies):.2f}ms")
        return {"name": name, "avg": avg, "p95": p95}
    return None

async def main():
    # Use headers to mimic a browser/common client
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json",
    }
    
    async with httpx.AsyncClient(
        base_url=BASE_URL, 
        timeout=30.0, 
        follow_redirects=True,
        headers=headers
    ) as client:
        # Step 1: Authenticate
        success = await authenticate(client)
        if not success:
            print("Aborting benchmark due to authentication failure.")
            return

        # Step 2: Run benchmarks
        results = []
        for ep in ENDPOINTS:
            res = await benchmark_endpoint(client, ep["name"], ep["url"], ep.get("params"))
            if res:
                results.append(res)
        
        print("\n" + "="*40)
        print(f"BENCHMARK RESULTS - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*40)
        for r in results:
            status = "PASS" if r["avg"] <= 200 else "SLOW"
            if r["avg"] <= 50: status = "EXCELLENT"
            print(f"{status.ljust(10)} | {r['name'].ljust(25)}: {r['avg']:>7.2f}ms (Avg)")
        print("="*40)

if __name__ == "__main__":
    print("Starting optimization benchmark...")
    asyncio.run(main())
