
# ToDoList-V2 (Desktop App)

A modern **To-Do List with Pomodoro Timer and Themes**, built with **Flask + Web UI** and packaged as a **desktop app** using PyWebView + PyInstaller.

---

## 📂 Project Structure

```
toDoList-V2/
├─ static/
│  ├─ css/style.css
│  └─ js/main.js
├─ templates/
│  └─ index.html
├─ app.py
└─ desktop.py
```

- **static/** → CSS/JS assets  
- **templates/** → Jinja2 HTML templates (Flask)  
- **app.py** → Flask backend (serves HTML/JS/CSS)  
- **desktop.py** → Desktop launcher (wraps Flask in a native WebView window)

---

## 🚀 Development

Run the app in development mode (browser only):

```powershell
python app.py
```

Visit [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## 🖥️ Desktop Build (Windows)

### 1. Install dependencies

```powershell
pip install flask pywebview pyinstaller
```

### 2. Run dev test

Make sure it works before building:

```powershell
python app.py
```

### 3. Build the `.exe`

From the project root (`toDoList-V2`):

```powershell
py -m PyInstaller `
  --noconsole `
  --onefile `
  --name ToDoList `
  --add-data "templates;templates" `
  --add-data "static;static" `
  .\desktop.py
```

Notes:
- In **cmd.exe** replace backticks (\`) with carets (^).  
- On **macOS/Linux** use `:` instead of `;` in `--add-data`.

### 4. Run the app

Your packaged app will be in:

```
dist/ToDoList.exe
```

Double-click to launch the desktop version.

---

## 🎨 Theming

- Dark (default)  
- Light  
- Green Forest  
- Ocean Vibe  
- Beach Love  

Scrollbar styling is themed to match your UI via `style.css`.

---

## 🔧 Common Issues

- **Blank window** → Ensure `resource_path` is in `app.py` and you included both `--add-data "templates;templates"` and `--add-data "static;static"`.  
- **Assets not loading** → Verify folder structure matches above.  
- **Port already in use** → Change `PORT` in both `app.py` and `desktop.py`.  

---

## 📦 Tech Stack

- Python (Flask, PyWebView)  
- HTML/CSS/JS (frontend)  
- PyInstaller (packaging)  

---

## 📝 License

MIT — use freely.
