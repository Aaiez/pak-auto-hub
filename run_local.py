"""Run PakAutoHub locally using Python standard library only."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import threading
import webbrowser

def main():
    try:
        port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
        if not 1 <= port <= 65535:
            raise ValueError
    except ValueError:
        print("Use a port from 1 to 65535: python run_local.py 8001")
        return 1
    folder = Path(__file__).resolve().parent / "dist"
    handler = partial(SimpleHTTPRequestHandler, directory=str(folder))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    except OSError as exc:
        print(f"Could not start: {exc}. Try another port: python run_local.py 8001")
        return 1
    url = f"http://127.0.0.1:{port}"
    print(f"PakAutoHub: {url}\nKeep this terminal open. Press Ctrl+C to stop.")
    timer = threading.Timer(0.7, webbrowser.open, args=(url,))
    timer.daemon = True
    timer.start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        timer.cancel()
        server.server_close()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
