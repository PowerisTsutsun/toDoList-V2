# app.py
import os, sys
from flask import Flask, render_template

def resource_path(rel):
    # When packaged with PyInstaller, data is unpacked to _MEIPASS
    base = getattr(sys, "_MEIPASS", os.path.abspath("."))
    return os.path.join(base, rel)

app = Flask(
    __name__,
    static_folder=resource_path("static"),
    template_folder=resource_path("templates"),
)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    # Dev run: http://127.0.0.1:5000
    app.run(host="127.0.0.1", port=5000, debug=True)
