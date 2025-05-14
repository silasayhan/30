class TodoManager {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
  }

  addTodo(text, date = '') {
    const todo = { id: Date.now(), text, completed: false, date };
    this.todos.push(todo);
    this.save();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.save();
  }

  toggleComplete(id) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) todo.completed = !todo.completed;
    this.save();
  }

  editTodo(id, newText) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) todo.text = newText;
    this.save();
  }

  clearAll() {
    this.todos = [];
    this.save();
  }

  getFilteredTodos(filter) {
    switch (filter) {
      case 'pending': return this.todos.filter(todo => !todo.completed);
      case 'completed': return this.todos.filter(todo => todo.completed);
      default: return this.todos;
    }
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  getCompletedCount() {
    return this.todos.filter(todo => todo.completed).length;
  }
}

class UIManager {
  constructor(todoManager) {
    this.todoManager = todoManager;
    this.taskList = document.getElementById('task-list');
    this.taskInput = document.getElementById('task-input');
    this.dateInput = document.getElementById('date-input');
    this.addTaskBtn = document.getElementById('add-task-btn');
    this.filter = document.getElementById('filter');
    this.deleteAllBtn = document.getElementById('delete-all-btn');
    this.completedCountEl = document.getElementById('completed-count');
    this.addEventListeners();
    this.render();
  }

  addEventListeners() {
    this.addTaskBtn.addEventListener('click', () => this.handleAdd());
    this.taskInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.handleAdd();
    });

    this.filter.addEventListener('change', () => this.render());
    this.deleteAllBtn.addEventListener('click', () => {
      this.todoManager.clearAll();
      this.render();
    });
  }

  handleAdd() {
    const text = this.taskInput.value.trim();
    const date = this.dateInput.value;
    if (!text) return;
    this.todoManager.addTodo(text, date);
    this.taskInput.value = '';
    this.dateInput.value = '';
    this.render();
  }

  handleEdit(id, textEl) {
    const newText = prompt('Edit your task:', textEl.textContent);
    if (newText !== null && newText.trim() !== '') {
      this.todoManager.editTodo(id, newText.trim());
      this.render();
    }
  }

  render() {
    const todos = this.todoManager.getFilteredTodos(this.filter.value);
    this.taskList.innerHTML = '';

    if (todos.length === 0) {
      this.taskList.innerHTML = '<li class="text-center text-sm text-gray-400">No tasks to show</li>';
    }

    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `flex items-center justify-between p-2 rounded border ${todo.completed ? 'bg-green-50' : 'bg-white'} shadow`;

      const text = document.createElement('span');
      text.textContent = todo.text + (todo.date ? ` (${todo.date})` : '');
      if (todo.completed) text.classList.add('line-through', 'text-gray-500');

      const buttons = document.createElement('div');
      buttons.className = 'space-x-1';

      const checkBtn = document.createElement('button');
      checkBtn.innerHTML = '<i class="bx bx-check"></i>';
      checkBtn.className = 'btn btn-xs btn-success';
      checkBtn.addEventListener('click', () => {
        this.todoManager.toggleComplete(todo.id);
        this.render();
      });

      const editBtn = document.createElement('button');
      editBtn.innerHTML = '<i class="bx bx-edit"></i>';
      editBtn.className = 'btn btn-xs btn-warning';
      editBtn.addEventListener('click', () => this.handleEdit(todo.id, text));

      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '<i class="bx bx-trash"></i>';
      deleteBtn.className = 'btn btn-xs btn-error';
      deleteBtn.addEventListener('click', () => {
        this.todoManager.deleteTodo(todo.id);
        this.render();
      });

      buttons.append(checkBtn, editBtn, deleteBtn);
      li.append(text, buttons);
      this.taskList.appendChild(li);
    });

    this.completedCountEl.textContent = `Completed tasks: ${this.todoManager.getCompletedCount()}`;
  }
}

class ThemeSwitcher {
  constructor() {
    this.themeItems = document.querySelectorAll('.theme-list a');
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

    this.themeItems.forEach(item => {
      item.addEventListener('click', () => {
        const theme = item.dataset.setTheme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const todoManager = new TodoManager();
  new UIManager(todoManager);
  new ThemeSwitcher();
});
