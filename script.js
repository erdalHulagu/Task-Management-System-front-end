const taskList = document.getElementById('taskList');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('desc');

// 🔹 Tüm taskleri getir
const SERVER_URL = "http://localhost:8000";

function loadTasks() {
    fetch(`${SERVER_URL}/tasks`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("task-list");
            list.innerHTML = "";
            data.forEach(task => {
                const li = document.createElement("li");
                li.textContent = `[${task.id}] ${task.title} - ${task.description}`;
                list.appendChild(li);
            });
        });
}

function addTask() {
    const title = document.getElementById("title").value;
    const desc  = document.getElementById("desc").value;

    fetch(`${SERVER_URL}/add?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}`)
        .then(() => {
            loadTasks();
            document.getElementById("title").value = "";
            document.getElementById("desc").value = "";
        });
}


// 🔹 Task ekle
function addTask() {
    let title = document.getElementById("title").value;
    let desc = document.getElementById("desc").value;

    fetch(`/add?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}`)
        .then(() => {
            loadTasks();  // Listeyi güncelle
            document.getElementById("title").value = "";
            document.getElementById("desc").value = "";
        });
}

// 🔹 Task sil
function deleteTask(id) {
    fetch(`/delete?id=${id}`)
        .then(() => loadTasks());
}

// 🔹 Task güncelle (başlık)
function updateTask(id) {
    const newTitle = prompt("Enter new title:");
    if(!newTitle) return;

    fetch(`/update?id=${id}&title=${encodeURIComponent(newTitle)}`)
        .then(() => loadTasks());
}

// 🔹 Sayfa yüklendiğinde
window.onload = loadTasks;
