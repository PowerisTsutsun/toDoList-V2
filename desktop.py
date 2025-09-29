# desktop.py
import threading, time, webbrowser, socket
import webview
from app import app

HOST, PORT = "127.0.0.1", 5000

def port_open(host, port):
    s = socket.socket()
    s.settimeout(0.2)
    try:
        s.connect((host, port))
        s.close()
        return True
    except Exception:
        return False

def run_flask():
    # No debug/reloader in packaged app
    app.run(host=HOST, port=PORT, debug=False, use_reloader=False)

if __name__ == "__main__":
    t = threading.Thread(target=run_flask, daemon=True)
    t.start()

    # Wait for the server to be ready
    for _ in range(100):
        if port_open(HOST, PORT):
            break
        time.sleep(0.05)

    # Open the app in a native WebView window
    webview.create_window("To-Do", f"http://{HOST}:{PORT}", width=900, height=700)
    webview.start()
