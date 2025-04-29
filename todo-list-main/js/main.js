class TodoItemFormatter {
  format(todo) {
    const checkedClass = todo.completed ? "line-through text-gray-500" : "";
    const dueDateHtml = todo.dueDate
      ? `<span class="text-xs text-gray-400">(${todo.dueDate})</span>`
      : "";
    return `<span class="${checkedClass}">${todo.text} ${dueDateHtml}</span>`;
  }
}

class TodoManager {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
  }

  addTodo(text, dueDate) {
    if (!text.trim()) return;
    this.todos.push({
      text: text.trim(),
      completed: false,
      dueDate: dueDate || null,
    });
    this.saveTodos();
  }

  editTodo(index, newText, newDueDate) {
    if (!newText.trim()) return;
    this.todos[index].text = newText.trim();
    this.todos[index].dueDate = newDueDate || null;
    this.saveTodos();
  }

  deleteTodo(index) {
    this.todos.splice(index, 1);
    this.saveTodos();
  }

  toggleComplete(index) {
    this.todos[index].completed = !this.todos[index].completed;
    this.saveTodos();
  }

  clearAll() {
    this.todos = [];
    this.saveTodos();
  }

  filterTodos(filter) {
    switch (filter) {
      case "pending":
        return this.todos.filter((t) => !t.completed);
      case "completed":
        return this.todos.filter((t) => t.completed);
      default:
        return this.todos;
    }
  }

  sortTodosByDate() {
    this.todos.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
      return dateA - dateB;
    });
  }

  saveTodos() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }
}

class ThemeSwitcher {
  constructor() {
    if (ThemeSwitcher.instance) return ThemeSwitcher.instance;
    this.themeSelect = document.getElementById("theme-select");
    this.applySavedTheme();
    this.themeSelect.addEventListener("change", (e) =>
      this.changeTheme(e.target.value)
    );
    ThemeSwitcher.instance = this;
  }

  applySavedTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    this.changeTheme(savedTheme);
    this.themeSelect.value = savedTheme;
  }

  changeTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }
}

class UIManager {
  constructor(todoManager, formatter) {
    this.todoManager = todoManager;
    this.formatter = formatter;
    this.input = document.getElementById("todo-input");
    this.dateInput = document.getElementById("todo-date");
    this.list = document.getElementById("todo-list");
    this.filterSelect = document.getElementById("filter-select");
    this.clearBtn = document.getElementById("clear-btn");

    this.addEventListeners();
    this.displayTodos();
  }

  addEventListeners() {
    document.getElementById("add-btn").addEventListener("click", () => {
      this.todoManager.addTodo(this.input.value, this.dateInput.value);
      this.clearInputs();
      this.displayTodos();
    });

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.todoManager.addTodo(this.input.value, this.dateInput.value);
        this.clearInputs();
        this.displayTodos();
      }
    });

    this.filterSelect.addEventListener("change", () => this.displayTodos());
    this.clearBtn.addEventListener("click", () => {
      this.todoManager.clearAll();
      this.displayTodos();
    });
  }

  displayTodos() {
    this.todoManager.sortTodosByDate(); // 👈 Sıralama Burada Yapılıyor
    const filtered = this.todoManager.filterTodos(this.filterSelect.value);
    this.list.innerHTML = "";
    filtered.forEach((todo, index) => {
      const li = document.createElement("li");
      li.className =
        "flex justify-between items-center p-2 border-b border-gray-200";

      const span = document.createElement("span");
      span.innerHTML = this.formatter.format(todo);
      li.appendChild(span);

      const btnGroup = document.createElement("div");

      const completeBtn = this.createIconButton("✔️", () => {
        this.todoManager.toggleComplete(index);
        this.displayTodos();
      });

      const editBtn = this.createIconButton("✏️", () => {
        const newText = prompt("Edit task:", todo.text);
        const newDate = prompt("Edit due date:", todo.dueDate || "");
        if (newText !== null) {
          this.todoManager.editTodo(index, newText, newDate);
          this.displayTodos();
        }
      });

      const deleteBtn = this.createIconButton("🗑️", () => {
        this.todoManager.deleteTodo(index);
        this.displayTodos();
      });

      btnGroup.appendChild(completeBtn);
      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);

      li.appendChild(btnGroup);
      this.list.appendChild(li);
    });
  }

  createIconButton(icon, action) {
    const btn = document.createElement("button");
    btn.innerHTML = icon;
    btn.className =
      "text-sm ml-2 hover:scale-110 transition-transform duration-200";
    btn.addEventListener("click", action);
    return btn;
  }

  clearInputs() {
    this.input.value = "";
    this.dateInput.value = "";
  }
}

// Giriş Noktası
document.addEventListener("DOMContentLoaded", () => {
  const todoManager = new TodoManager();
  const formatter = new TodoItemFormatter();
  new UIManager(todoManager, formatter);
  new ThemeSwitcher();
});
