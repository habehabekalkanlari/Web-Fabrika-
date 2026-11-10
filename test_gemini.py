import os
import json
import urllib.request
from pathlib import Path

def get_gemini_api_key():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        env_path = Path(".env.local")
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip("'\"")
                    if k in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
                        api_key = v
                        break
    return api_key

api_key = get_gemini_api_key()
if not api_key:
    print("API key not found")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
payload = {
    "contents": [{"parts": [{"text": "Hello"}]}]
}
body = json.dumps(payload).encode("utf-8")

print(f"Testing URL: {url}")
try:
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        print("Success!")
        print(r.read().decode("utf-8"))
except Exception as e:
    print(f"Error: {e}")
