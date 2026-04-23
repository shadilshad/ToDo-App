let currentFilter = null;
let currentSort = null;

// Load tasks from localStorage
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Notification permission
if ("Notification" in window) {
  Notification.requestPermission().catch(() => {});
}

// Prevent repeated alerts
let notifiedTasks = new Set(JSON.parse(localStorage.getItem("notifiedTasks")) || []);

function saveTasks() {
  localStorage.setItem("todos", JSON.stringify(todos));
  localStorage.setItem("notifiedTasks", JSON.stringify([...notifiedTasks]));
}

// Load and render tasks
function loadTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  let filteredTasks = [...todos];

  // Filter
  if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter(todo => todo.completed);
  } else if (currentFilter === "pending") {
    filteredTasks = filteredTasks.filter(todo => !todo.completed);
  }

  // Sort
  if (currentSort === "deadline") {
    filteredTasks.sort((a, b) => new Date(a.deadline || "9999-12-31") - new Date(b.deadline || "9999-12-31"));
  } else if (currentSort === "priority") {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  filteredTasks.forEach((todo, index) => {
    let li = document.createElement("li");
    let taskContainer = document.createElement("div");

    // Task text
    let span = document.createElement("span");
    span.className = "task";
    span.innerText = todo.task;

    if (todo.completed) {
      span.classList.add("completed");
    }

    span.onclick = () => toggleComplete(index);

    // Meta info
    let meta = document.createElement("div");
    meta.className = "task-meta";

    let priorityIcon = "";
    if (todo.priority === "High") priorityIcon = "🔥";
    else if (todo.priority === "Medium") priorityIcon = "⚡";
    else if (todo.priority === "Low") priorityIcon = "🌿";

    let deadlineText = "";

    if (todo.deadline) {
      let today = new Date();
      today.setHours(0, 0, 0, 0);

      let deadlineDate = new Date(todo.deadline);
      deadlineDate.setHours(0, 0, 0, 0);

      let diffDays = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        deadlineText = " ❌ Overdue";
        li.classList.add("urgent");
        triggerAlert(todo, "overdue");
      } else if (diffDays === 0) {
        deadlineText = " ⚠️ Today";
        li.classList.add("urgent");
        triggerAlert(todo, "today");
      } else if (diffDays === 1) {
        deadlineText = " ⏰ Tomorrow";
      } else {
        deadlineText = ` 📅 ${todo.deadline}`;
      }
    }

    meta.innerText = `${priorityIcon} ${todo.priority || ""}${deadlineText}`;

    taskContainer.appendChild(span);
    taskContainer.appendChild(meta);

    // Delete button
    let del = document.createElement("button");
    del.innerText = "Delete";
    del.className = "delete-btn";
    del.onclick = () => deleteTask(index);

    li.appendChild(taskContainer);
    li.appendChild(del);
    list.appendChild(li);
  });
}

// Add task
function addTask() {
  let task = document.getElementById("taskInput").value.trim();
  let priority = document.getElementById("priorityInput").value;
  let deadline = document.getElementById("deadlineInput").value;

  if (!task) return;

  todos.push({
    task,
    completed: false,
    priority,
    deadline
  });

  document.getElementById("taskInput").value = "";
  document.getElementById("deadlineInput").value = "";

  saveTasks();
  loadTasks();
}

// Delete task
function deleteTask(index) {
  todos.splice(index, 1);
  saveTasks();
  loadTasks();
}

// Toggle completion
function toggleComplete(index) {
  todos[index].completed = !todos[index].completed;
  saveTasks();
  loadTasks();
}

// Filter tasks
function filterTasks(status) {
  currentFilter = status;
  currentSort = null;
  loadTasks();
}

// Sort tasks
function sortTasks(type) {
  currentSort = type;
  currentFilter = null;
  loadTasks();
}

// Notifications
function triggerAlert(todo, type) {
  if (notifiedTasks.has(todo.task)) return;

  if (todo.priority === "Low" && type !== "overdue") return;

  notifiedTasks.add(todo.task);
  saveTasks();

  showToast(`${type === "overdue" ? "❌ Overdue" : "⚠️ Due Today"}: ${todo.task}`);

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Task Reminder 🚨", {
      body: todo.task
    });
  }
}

// Toast message
function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Auto refresh
setInterval(loadTasks, 20000);

// Initial load
loadTasks();