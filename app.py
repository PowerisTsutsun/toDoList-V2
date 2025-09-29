import time
from flask import Flask, render_template, request, jsonify
from datetime import datetime, date

# Initialize the Flask app and task data
app = Flask(__name__, static_folder='static', template_folder='templates')

# In-memory database for simplicity
tasks_data = [] 
next_task_id = 1 # To give each task a unique ID

# --- Main Route ---
@app.route('/')
def home():
    """Serves the main HTML page that contains the app."""
    return render_template('index.html')

# --- API Endpoints ---

@app.route('/api/dashboard_info', methods=['GET'])
def get_dashboard_info():
    """Provides the dynamic data for the top tiles."""
    today = date.today()
    due_today_count = sum(
        1 for task in tasks_data 
        if not task.get("done") and task.get("due") and datetime.strptime(task["due"], "%Y-%m-%d").date() == today
    )
    return jsonify({
        "username": "Power", # This can be loaded from a config file later
        "due_today": due_today_count
    })

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Returns the complete list of tasks."""
    return jsonify(tasks_data)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Adds a new task to the list."""
    global next_task_id
    task_info = request.json
    
    new_task = {
        "id": next_task_id,
        "text": task_info.get('text', 'Unnamed Task'),
        "pr": task_info.get('pr', 'Normal'),
        "due": task_info.get('due') if task_info.get('due') else None, # Expects "YYYY-MM-DD"
        "done": False,
    }
    tasks_data.append(new_task)
    next_task_id += 1
    return jsonify({"message": "Task added!", "task": new_task}), 201

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Deletes a specific task by its ID."""
    global tasks_data
    tasks_data = [task for task in tasks_data if task['id'] != task_id]
    return jsonify({"message": f"Task {task_id} deleted."})

@app.route('/api/tasks/completed', methods=['DELETE'])
def delete_completed_tasks():
    """Deletes all tasks that are marked as done."""
    global tasks_data
    tasks_data = [task for task in tasks_data if not task.get('done')]
    return jsonify({"message": "Completed tasks cleared."})


@app.route('/api/tasks/<int:task_id>/toggle', methods=['PUT'])
def toggle_task_done(task_id):
    """Toggles the 'done' status of a task."""
    for task in tasks_data:
        if task['id'] == task_id:
            task['done'] = not task.get('done', False)
            return jsonify({"message": f"Task {task_id} updated.", "task": task})
    return jsonify({"message": "Task not found."}), 404

if __name__ == '__main__':
    # This allows you to run the app directly for testing
    app.run(debug=True)

