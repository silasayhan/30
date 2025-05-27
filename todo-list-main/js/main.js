class TodoItemFormatter {
  format(todo, index) {
    const formattedDate = todo.date ? new Date(todo.date).toLocaleDateString() : '';
    return `
      <li class="flex justify-between items-center gap-2 p-2 border rounded ${todo.completed ? 'line-through opacity-50' : ''}">
        <div class="flex flex-col">
          <span>${todo.text}</span>
          <small class="text-xs text-gray-500">${formattedDate}</small>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-sm btn-success" onclick="uiManager.toggleComplete(${index})"><i class='bx bx-check'></i></button>
          <button class="btn btn-sm btn-warning" onclick="uiManager.editTodo(${index})"><i class='bx bx-edit'></i></button>
          <button class="btn btn-sm btn-error" onclick="uiManager.deleteTodo(${index})"><i class='bx bx-trash'></i></button>
        </div>
      </li>
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

  update(index, updatedTodo) {
    this.todos[index] = updatedTodo;
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

  groupByDate() {
    const today = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    return this.todos.reduce((acc, todo, index) => {
      const date = todo.date ? new Date(todo.date).toDateString() : "Gelecek";
      const key =
        date === today ? "Bugun" :
        date === tomorrowStr ? "Yarin" : "Gelecek";

      if (!acc[key]) acc[key] = [];
      acc[key].push({ todo, index });
      return acc;
    }, {});
  }
}

class UIManager {
  constructor(formatter, manager) {
    this.formatter = formatter;
    this.manager = manager;
    this.list = document.getElementById("todo-list");
    this.form = document.getElementById("todo-form");
    this.input = document.getElementById("todo-input");
    this.date = document.getElementById("todo-date");

    this.form.onsubmit = (e) => {
      e.preventDefault();
      const newTodo = {
        text: this.input.value.trim(),
        completed: false,
        date: this.date.value || null
      };
      this.manager.add(newTodo);
      this.input.value = "";
      this.date.value = "";
      this.render();
    };

    this.render();
  }

  render() {
    this.list.innerHTML = "";

    const grouped = this.manager.groupByDate();
    const groups = ["Bugun", "Yarin", "Gelecek"];

    groups.forEach((group) => {
      if (grouped[group] && grouped[group].length > 0) {
        const section = document.createElement("section");
        section.innerHTML = `<h2 class="text-lg font-bold mb-2">${group}</h2><ul class="space-y-2">${grouped[group].map(({ todo, index }) => this.formatter.format(todo, index)).join("")}</ul>`;
        this.list.appendChild(section);
      }
    });

    if (this.manager.todos.length === 0) {
      this.list.innerHTML = "";
    }
  }

  editTodo(index) {
    const updatedText = prompt("Yeni Metni Girin:", this.manager.todos[index].text);
    if (updatedText !== null) {
      this.manager.update(index, { ...this.manager.todos[index], text: updatedText });
      this.render();
    }
  }

  deleteTodo(index) {
    if (confirm("Bu Gorevi Silmek Istiyor Musunuz?")) {
      this.manager.delete(index);
      this.render();
    }
  }

  toggleComplete(index) {
    this.manager.toggle(index);
    this.render();
  }
}

class ThemeSwitcher {
  constructor() {
    if (!ThemeSwitcher.instance) {
      this.button = document.getElementById("theme-toggle");
      this.currentTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      this.applyTheme(this.currentTheme);

      this.button.onclick = () => {
        this.currentTheme = this.currentTheme === "light" ? "dark" : "dark";
        this.applyTheme(this.currentTheme);
      };

      ThemeSwitcher.instance = this;
    }
    return ThemeSwitcher.instance;
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }
}

const formatter = new TodoItemFormatter();
const manager = new TodoManager();
const uiManager = new UIManager(formatter, manager);
const themeSwitcher = new ThemeSwitcher();
