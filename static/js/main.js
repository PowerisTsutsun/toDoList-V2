// main.js

document.addEventListener('DOMContentLoaded', () => {
  // ===== Element References =====
  const userGreetingElem   = document.getElementById('user-greeting');
  const dueTodayCountElem  = document.getElementById('due-today-count');
  const currentDateElem    = document.getElementById('current-date');

  const taskListContainer  = document.getElementById('task-list-container');
  const addTaskBtn         = document.getElementById('add-task-btn');
  const taskInput          = document.getElementById('task-input');
  const dateInput          = document.getElementById('date-input');
  const prioritySelect     = document.getElementById('priority-select');
  const clearCompletedBtn  = document.getElementById('clear-completed-btn');

  const navButtons         = document.querySelectorAll('nav button[data-view]');
  const views              = document.querySelectorAll('.view');
  const navAddButton       = document.getElementById('nav-add-btn');

  const themeSelect        = document.getElementById('theme-select');
  const usernameInput      = document.getElementById('username-input');

  // Timer elements
  const timerDisplay       = document.getElementById('timer-display');
  const durationInput      = document.getElementById('duration-input');
  const timerStartBtn      = document.getElementById('timer-start-btn');
  const timerPauseBtn      = document.getElementById('timer-pause-btn');
  const timerResetBtn      = document.getElementById('timer-reset-btn');
  
  // Background controls
  const bgUrlInput       = document.getElementById('bg-url');
  const bgApplyBtn       = document.getElementById('bg-apply-url');
  const bgClearBtn       = document.getElementById('bg-clear');
  const bgOverlaySlider  = document.getElementById('bg-overlay');
  const bgBlurSlider     = document.getElementById('bg-blur');
  const bgOverlayValue   = document.getElementById('bg-overlay-val');
  const bgBlurValue      = document.getElementById('bg-blur-val');

  // ===== LocalStorage Keys =====
  const LS_TASKS     = 'todo.tasks';
  const LS_THEME     = 'todo.theme';
  const LS_USERNAME  = 'todo.username';
  const LS_TIMER_MIN = 'todo.timerMin';
  const LS_BG_IMG     = 'todo.bgImage';
  const LS_BG_OVERLAY = 'todo.bgOverlay';
  const LS_BG_BLUR    = 'todo.bgBlur';

  // ===== Helpers =====
  const loadTasks = () => JSON.parse(localStorage.getItem(LS_TASKS) || '[]');
  const saveTasks = (tasks) => localStorage.setItem(LS_TASKS, JSON.stringify(tasks));

  // Unique ID generator
  const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  // ===== View Switching =====
  const switchView = (viewId) => {
    views.forEach(v => v.classList.remove('active-view'));
    const target = document.getElementById(viewId + '-view');
    if (target) target.classList.add('active-view');
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));
  };
  navButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
  if (navAddButton) {
    navAddButton.addEventListener('click', () => {
      switchView('home');
      taskInput?.focus();
    });
  }

  // ===== Settings: Username & Theme =====
  const applySettings = () => {
    const theme = localStorage.getItem(LS_THEME) || 'dark';
    const username = localStorage.getItem(LS_USERNAME) || 'Power';
    document.documentElement.setAttribute('data-theme', theme);
    if (userGreetingElem) userGreetingElem.textContent = `Hello, ${username}`;
    if (themeSelect) themeSelect.value = theme;
    if (usernameInput) usernameInput.value = username;
  };

  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      localStorage.setItem(LS_THEME, themeSelect.value);
      applySettings();
    });
  }
  if (usernameInput) {
    usernameInput.addEventListener('input', () => {
      localStorage.setItem(LS_USERNAME, usernameInput.value);
      applySettings();
    });
  }
  
  // ===== Appearance: Background URL / Overlay / Blur =====
  const applyAppearance = () => {
    const url     = localStorage.getItem(LS_BG_IMG);
    const overlay = parseFloat(localStorage.getItem(LS_BG_OVERLAY) ?? '0.45');
    const blur    = parseInt(localStorage.getItem(LS_BG_BLUR) ?? '0', 10);

    document.documentElement.style.setProperty('--bg-image', url ? `url("${url}")` : 'none');
    document.documentElement.style.setProperty('--bg-overlay', `rgba(0,0,0,${overlay})`);
    document.documentElement.style.setProperty('--bg-blur', `${blur}px`);

    // Sync UI controls with current values
    if (bgUrlInput) bgUrlInput.value = url || '';
    if (bgOverlaySlider) {
        bgOverlaySlider.value = Math.round(overlay * 100);
        if (bgOverlayValue) bgOverlayValue.textContent = `${Math.round(overlay * 100)}%`;
    }
    if (bgBlurSlider) {
        bgBlurSlider.value = blur;
        if (bgBlurValue) bgBlurValue.textContent = `${blur}`;
    }
  };

  // Apply background URL
  if (bgApplyBtn) {
    bgApplyBtn.addEventListener('click', () => {
      const url = (bgUrlInput.value || '').trim();
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          localStorage.setItem(LS_BG_IMG, url);
          applyAppearance();
      } else if (url) {
          alert('Please enter a valid URL starting with http or https.');
      }
    });
  }
  
  // Clear background
  if (bgClearBtn) {
    bgClearBtn.addEventListener('click', () => {
        localStorage.removeItem(LS_BG_IMG);
        applyAppearance();
    });
  }

  // Overlay slider
  if (bgOverlaySlider) {
    bgOverlaySlider.addEventListener('input', () => {
        const overlayValue = bgOverlaySlider.value / 100;
        localStorage.setItem(LS_BG_OVERLAY, overlayValue);
        applyAppearance();
    });
  }
  
  // Blur slider
  if (bgBlurSlider) {
    bgBlurSlider.addEventListener('input', () => {
        const blurValue = bgBlurSlider.value;
        localStorage.setItem(LS_BG_BLUR, blurValue);
        applyAppearance();
    });
  }
  
  // ===== Tasks: Model, Render, Actions =====
  // Normalize priority values from UI/old storage
  const normalizePriority = (val) => {
    const v = String(val || 'normal').toLowerCase();
    if (v === 'low' || v === 'none') return 'normal';
    return ['normal','medium','high'].includes(v) ? v : 'normal';
  };

  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const updateDashboard = () => {
    const tasks = loadTasks();
    const dueToday = tasks.filter(t => !t.done && t.dueDate === todayISO()).length;
    if (dueTodayCountElem) dueTodayCountElem.textContent = String(dueToday);
    if (currentDateElem) {
      const now = new Date();
      currentDateElem.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const taskItemHTML = (task) => {
    const pr = normalizePriority(task.priority);
    const priorityClass = pr === 'high' ? 'priority-high' : (pr === 'medium' ? 'priority-medium' : 'priority-normal');
    const due = task.dueDate ? `<small class="subtle">Due ${task.dueDate}</small>` : '';
    return `
      <div class="task-item ${task.done ? 'done' : ''}" data-id="${task.id}">
        <input type="checkbox" class="task-toggle" ${task.done ? 'checked' : ''} aria-label="Mark completed" />
        <p class="task-text ${priorityClass}" title="${task.text}">${task.text}</p>
        ${due}
        <button class="delete-btn" title="Delete task" aria-label="Delete">✕</button>
      </div>
    `;
  };

  const renderTasks = () => {
    if (!taskListContainer) return;
    const tasks = loadTasks();
    // Sort: undone first → by due date (empty last) → by creation time
    tasks.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return a.createdAt - b.createdAt;
    });
    taskListContainer.innerHTML = tasks.map(taskItemHTML).join('');
  };

  const addTask = () => {
    if (!taskInput || !taskInput.value.trim()) return;
    const text = taskInput.value.trim();
    const dueDate = dateInput?.value || '';
    const priority = normalizePriority(prioritySelect?.value || 'normal');
    const newTask = {
      id: uid(),
      text,
      dueDate,
      priority,
      done: false,
      createdAt: Date.now()
    };
    const tasks = loadTasks();
    tasks.push(newTask);
    saveTasks(tasks);
    taskInput.value = '';
    if (dateInput) dateInput.value = '';
    if (prioritySelect) prioritySelect.value = 'normal';
    
  // One-time migration to normalize priority labels in stored tasks
  (function migratePriorityOnce(){
    const tasks = loadTasks();
    let changed = false;
    for (const t of tasks) {
      const fixed = normalizePriority(t.priority);
      if (fixed !== t.priority) {
        t.priority = fixed;
        changed = true;
      }
    }
    if (changed) saveTasks(tasks);
  })();

  renderTasks();
    updateDashboard();
    taskInput.focus();
  };

  // ===== UI Enhancements & Event Bindings =====

  // Timer buttons: ensure they use the shared button styles
  if (timerStartBtn) {
    timerStartBtn.classList.add('btn','btn-primary','btn-lg');
  }
  if (timerPauseBtn) {
    timerPauseBtn.classList.add('btn','btn-primary','btn-lg');
  }
  if (timerResetBtn) {
    timerResetBtn.classList.add('btn','btn-primary','btn-lg');
  }

  // Tiny tip under Background URL input
  if (bgUrlInput && !document.getElementById('bg-tip-note')) {
    const tip = document.createElement('small');
    tip.id = 'bg-tip-note';
    tip.className = 'tip-muted';
    tip.textContent = 'Tip: For best results, use 1920 × 1080 px images.';
    if (bgUrlInput.parentElement) {
      bgUrlInput.parentElement.appendChild(tip);
    } else {
      bgUrlInput.insertAdjacentElement('afterend', tip);
    }
  }

  // Add Task button + Enter key
  if (addTaskBtn) {
    addTaskBtn.classList.add('btn', 'btn-primary', 'btn-lg');
    addTaskBtn.addEventListener('click', addTask);
  }
  if (taskInput) {
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
      }
    });
  }

  // Task list: toggle complete / delete (event delegation)
  if (taskListContainer) {
    taskListContainer.addEventListener('click', (e) => {
      const target = e.target;
      const item = target.closest('.task-item');
      if (!item) return;
      const id = item.getAttribute('data-id');
      let tasks = loadTasks();
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return;

      if (target.classList.contains('task-toggle')) {
        tasks[idx].done = !tasks[idx].done;
        saveTasks(tasks);
        renderTasks();
        updateDashboard();
      } else if (target.classList.contains('delete-btn')) {
        tasks.splice(idx, 1);
        saveTasks(tasks);
        renderTasks();
        updateDashboard();
      }
    });
  }

  // Clear completed tasks
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      const tasks = loadTasks().filter(t => !t.done);
      saveTasks(tasks);
      renderTasks();
      updateDashboard();
    });
  }
  
  // ===== Timer (with persistence) =====
  const initMin = parseInt(localStorage.getItem(LS_TIMER_MIN) || (durationInput?.value || '25'), 10);
  let secondsRemaining = (isNaN(initMin) ? 25 : initMin) * 60;
  let timerInterval = null;
  let isTimerRunning = false;

  const updateTimerDisplay = () => {
      if (!timerDisplay) return;
      const m = Math.floor(secondsRemaining / 60);
      const s = secondsRemaining % 60;
      timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const pauseTimer = () => { clearInterval(timerInterval); isTimerRunning = false; };
  const resetTimer = () => {
      pauseTimer();
      const m = parseInt(durationInput?.value || '25', 10);
      const minutes = isNaN(m) ? 25 : m;
      secondsRemaining = minutes * 60;
      updateTimerDisplay();
  };
  const startTimer = () => {
      if (isTimerRunning) return;
      isTimerRunning = true;
      timerInterval = setInterval(() => {
          secondsRemaining--;
          updateTimerDisplay();
          if (secondsRemaining <= 0) { pauseTimer(); resetTimer(); }
      }, 1000);
  };
  if (durationInput) {
      durationInput.value = String(isNaN(initMin) ? 25 : initMin);
      durationInput.addEventListener('change', () => {
          const m = parseInt(durationInput.value || '25', 10);
          localStorage.setItem(LS_TIMER_MIN, String(isNaN(m) ? 25 : m));
          resetTimer();
      });
  }
  if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
  if (timerPauseBtn) timerPauseBtn.addEventListener('click', pauseTimer);
  if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);

  // ===== Init =====
  applySettings();
  applyAppearance();
  switchView('home');
  renderTasks();
  updateDashboard();
  updateTimerDisplay();
});
