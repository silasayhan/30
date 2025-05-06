class TodoItemFormatter {
  format(todo, index) {
    const checked = todo.completed ? "checked" : "";
    const dueDate = todo.dueDate ? `<span class="text-sm text-gray-400">${todo.dueDate}</span>` : "";
    return `
      <div class="todo-item flex justify-between items-center p-2 border-b">
        <div class="flex items-center gap-2">
          <input type="checkbox" data-index="${index}" ${checked} class="toggle-complete" />
          <span class="${todo.completed ? 'line-through text-gray-400' : ''}">${todo.text}</span>
        </div>
        <div class="flex gap-2 items-center">
          ${dueDate}
          <button class="edit" data-index="${index}">✏️</button>
          <button class="delete" data-index="${index}">🗑️</button>
        </div>
      </div>
    `;
  }
}

class TodoManager {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
  }

  save() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  add(todo) {
    this.todos.push(todo);
    this.save();
  }

  delete(index) {
    this.todos.splice(index, 1);
    this.save();
  }

  toggle(index) {
    this.todos[index].completed = !this.todos[index].completed;
    this.save();
  }

  edit(index, newText, newDate) {
    this.todos[index].text = newText;
    this.todos[index].dueDate = newDate;
    this.save();
  }

  clear() {
    this.todos = [];
    this.save();
  }

  filter(status) {
    if (status === "completed") return this.todos.filter(t => t.completed);
    if (status === "pending") return this.todos.filter(t => !t.completed);
    return this.todos;
  }

  countCompleted() {
    return this.todos.filter(t => t.completed).length;
  }

  isEmpty() {
    return this.todos.length === 0;
  }
}

class UIManager {
  constructor(todoManager, formatter, themeSwitcher) {
    this.todoManager = todoManager;
    this.formatter = formatter;
    this.themeSwitcher = themeSwitcher;
    this.listContainer = document.getElementById("todo-list");
    this.form = document.getElementById("todo-form");
    this.input = document.getElementById("todo-input");
    this.dateInput = document.getElementById("todo-date");
    this.filterSelect = document.getElementById("filter");
    this.clearButton = document.getElementById("clear-all");
    this.completedCounter = document.getElementById("completed-counter");

    this.form.addEventListener("submit", this.addTodo.bind(this));
    this.filterSelect.addEventListener("change", this.render.bind(this));
    this.clearButton.addEventListener("click", this.clearAll.bind(this));
    this.listContainer.addEventListener("click", this.handleListClick.bind(this));

    this.render();
  }

  addTodo(e) {
    e.preventDefault();
    const text = this.input.value.trim();
    const dueDate = this.dateInput.value || "";
    if (!text) return;

    this.todoManager.add({ text, completed: false, dueDate });
    this.input.value = "";
    this.dateInput.value = "";
    this.render();
  }

  handleListClick(e) {
    const index = e.target.dataset.index;
    if (e.target.classList.contains("delete")) {
      this.todoManager.delete(index);
    } else if (e.target.classList.contains("toggle-complete")) {
      this.todoManager.toggle(index);
    } else if (e.target.classList.contains("edit")) {
      const newText = prompt("Yeni metni girin:", this.todoManager.todos[index].text);
      const newDate = prompt("Yeni tarih (YYYY-MM-DD):", this.todoManager.todos[index].dueDate);
      if (newText !== null) {
        this.todoManager.edit(index, newText.trim(), newDate.trim());
      }
    }
    this.render();
  }

  clearAll() {
    if (confirm("Tüm görevleri silmek istediğinizden emin misiniz?")) {
      this.todoManager.clear();
      this.render();
    }
  }

  render() {
    const filter = this.filterSelect.value;
    const todos = this.todoManager.filter(filter);
    this.listContainer.innerHTML = "";

    if (todos.length === 0) {
      this.listContainer.innerHTML = `<div class="text-center text-gray-500 mt-4">Henüz bir görevin yok. Hadi bugün bir şeyler başar! 🚀</div>`;
    } else {
      todos.forEach((todo, index) => {
        this.listContainer.innerHTML += this.formatter.format(todo, index);
      });
    }

    const completed = this.todoManager.countCompleted();
    this.completedCounter.textContent = `Tamamlanan görevler: ${completed}`;
  }
}

class ThemeSwitcher {
  constructor() {
    if (!ThemeSwitcher.instance) {
      ThemeSwitcher.instance = this;
      this.init();
    }
    return ThemeSwitcher.instance;
  }

  init() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  }
}

// DOM hazır olduğunda başlat
document.addEventListener("DOMContentLoaded", () => {
  const formatter = new TodoItemFormatter();
  const manager = new TodoManager();
  const themeSwitcher = new ThemeSwitcher();
  new UIManager(manager, formatter, themeSwitcher);
});
