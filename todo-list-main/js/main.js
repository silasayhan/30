class TodoItemFormatter {
  format(item) {
    return `
      <div class="todo-item ${item.completed ? 'line-through opacity-50' : ''}" data-id="${item.id}">
        <div class="flex items-center gap-2">
          <input type="checkbox" ${item.completed ? 'checked' : ''} class="toggle-checkbox">
          <span class="task-text">${item.text}</span>
        </div>
        <div class="flex gap-2">
          <button class="edit-btn btn btn-xs btn-info">Edit</button>
          <button class="delete-btn btn btn-xs btn-error">Delete</button>
        </div>
      </div>
    `;
  }
}

class TodoManager {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
  }

  addTodo(text) {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };
    this.todos.push(newTodo);
    this.save();
    return newTodo;
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.save();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save();
    }
  }

  updateTodo(id, newText) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = newText;
      this.save();
    }
  }

  clearAll() {
    this.todos = [];
    this.save();
  }

  getFilteredTodos(filter) {
    if (filter === 'completed') return this.todos.filter(t => t.completed);
    if (filter === 'pending') return this.todos.filter(t => !t.completed);
    return this.todos;
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
}

class UIManager {
  constructor(todoManager, formatter) {
    this.todoManager = todoManager;
    this.formatter = formatter;
    this.todoList = document.getElementById('todo-list');
    this.todoInput = document.getElementById('todo-input');
    this.addBtn = document.getElementById('add-btn');
    this.filterSelect = document.getElementById('filter-select');
    this.clearBtn = document.getElementById('clear-btn');

    this.addEventListeners();
    this.renderTodos();
  }

  addEventListeners() {
    this.addBtn.addEventListener('click', () => this.handleAddTodo());
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleAddTodo();
    });
    this.todoList.addEventListener('click', (e) => this.handleListClick(e));
    this.filterSelect.addEventListener('change', () => this.renderTodos());
    this.clearBtn.addEventListener('click', () => this.handleClearAll());
  }

  handleAddTodo() {
    const text = this.todoInput.value.trim();
    if (!text) return;
    const newTodo = this.todoManager.addTodo(text);
    this.todoInput.value = '';
    this.renderTodos();
  }

  handleListClick(e) {
    const itemDiv = e.target.closest('.todo-item');
    const id = Number(itemDiv.dataset.id);

    if (e.target.classList.contains('delete-btn')) {
      this.todoManager.deleteTodo(id);
      this.renderTodos();
    } else if (e.target.classList.contains('edit-btn')) {
      const newText = prompt('Edit task:', itemDiv.querySelector('.task-text').textContent);
      if (newText) {
        this.todoManager.updateTodo(id, newText);
        this.renderTodos();
      }
    } else if (e.target.classList.contains('toggle-checkbox')) {
      this.todoManager.toggleTodo(id);
      this.renderTodos();
    }
  }

  handleClearAll() {
    if (confirm('Clear all tasks?')) {
      this.todoManager.clearAll();
      this.renderTodos();
    }
  }

  renderTodos() {
    const filter = this.filterSelect.value;
    const todos = this.todoManager.getFilteredTodos(filter);

    if (todos.length === 0) {
      this.todoList.innerHTML = `
        <div class="text-center mt-4 text-lg font-semibold text-gray-500">
          Görev kutun boş! Hadi bugün bir şeyler başaralım 💪✨
        </div>
      `;
      return;
    }

    this.todoList.innerHTML = todos.map(todo => this.formatter.format(todo)).join('');
  }
}

class ThemeSwitcher {
  constructor() {
    if (ThemeSwitcher.instance) return ThemeSwitcher.instance;
    this.themeSelect = document.getElementById("theme-select");

    this.applyInitialTheme();

    this.themeSelect.addEventListener("change", (e) =>
      this.changeTheme(e.target.value)
    );

    ThemeSwitcher.instance = this;
  }

  applyInitialTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      this.changeTheme(savedTheme);
      this.themeSelect.value = savedTheme;
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const systemTheme = prefersDark ? "dark" : "light";
      this.changeTheme(systemTheme);
      this.themeSelect.value = systemTheme;
    }
  }

  changeTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }
}

// App initialization
document.addEventListener("DOMContentLoaded", () => {
  const todoManager = new TodoManager();
  const formatter = new TodoItemFormatter();
  new UIManager(todoManager, formatter);
  new ThemeSwitcher();
});
