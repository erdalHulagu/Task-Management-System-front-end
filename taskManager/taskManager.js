import { Profile } from "../profile/Profile.js";

export class TaskManager {
    constructor(taskContainer, profileContainer, userId) {
        this.taskContainer = taskContainer;
        this.profileContainer = profileContainer;
        this.userId = userId;

        this.renderTaskPanel();
        this.loadProfile();
        this.loadTasks();
    }

    renderTaskPanel() {
        this.taskContainer.innerHTML = `
            <h2>My Tasks</h2>
            <div id="message"></div>
            <div class="form">
                <input type="text" id="title" placeholder="Task Title">
                <input type="text" id="desc" placeholder="Task Description">
                <button id="addBtn">Add Task</button>
            </div>
            <ul id="taskList"></ul>
        `;

        document.getElementById("addBtn").addEventListener("click", () => this.addTask());
    }

    async loadProfile() {
        this.profile = new Profile(this.profileContainer, this.userId);
    }

    async loadTasks() {
        try {
            const res = await fetch(`http://localhost:8000/tasks?userId=${this.userId}`);
            const tasks = await res.json();
            const list = document.getElementById("taskList");
            list.innerHTML = "";
            tasks.forEach(task => {
                const li = document.createElement("li");
                li.className = "task-item";
                li.innerHTML = `
                    <div>
                        <h3>${task.title}</h3>
                        <p>${task.description || ""}</p>
                    </div>
                    <div>
                        <button class="update-btn">✏️</button>
                        <button class="delete-btn">🗑️</button>
                    </div>
                `;

                // Güncelleme butonuna tıklama
                li.querySelector(".update-btn").addEventListener("click", () => {
                    const newTitle = prompt("Yeni başlık:", task.title);
                    if (newTitle && newTitle.trim() !== "") {
                        this.updateTask(task.id, newTitle.trim());
                    }
                });

                // Silme butonuna tıklama
                li.querySelector(".delete-btn").addEventListener("click", () => {
                    if (confirm("Bu görevi silmek istediğine emin misin?")) {
                        this.deleteTask(task.id);
                    }
                });

                list.appendChild(li);
            });
        } catch (err) { 
            this.showMessage("Görevler yüklenemedi!", true); 
        }
    }

    async addTask() {
        const title = document.getElementById("title").value.trim();
        const desc = document.getElementById("desc").value.trim();
        if (!title) { this.showMessage("Title is mandatory!", true); return; }

        try {
            const res = await fetch(`http://localhost:8000/add?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&userId=${this.userId}`);
            if (res.ok) {
                this.showMessage("Görev eklendi!");
                document.getElementById("title").value = "";
                document.getElementById("desc").value = "";
                this.loadTasks();
            } else this.showMessage("Görev eklenemedi!", true);
        } catch (err) { 
            this.showMessage("Sunucuya bağlanılamadı!", true); 
        }
    }

    async deleteTask(id) {
        try {
            const res = await fetch(`http://localhost:8000/delete?id=${id}&userId=${this.userId}`);
            if (res.ok) {
                this.showMessage("Görev silindi!");
                this.loadTasks();
            } else {
                this.showMessage("Silme başarısız!", true);
            }
        } catch (err) {
            this.showMessage("Sunucuya bağlanılamadı!", true);
        }
    }

    async updateTask(id, newTitle) {
        try {
            const res = await fetch(`http://localhost:8000/update?id=${id}&title=${encodeURIComponent(newTitle)}&userId=${this.userId}`);
            if (res.ok) {
                this.showMessage("Görev güncellendi!");
                this.loadTasks();
            } else {
                this.showMessage("Güncelleme başarısız!", true);
            }
        } catch (err) {
            this.showMessage("Sunucuya bağlanılamadı!", true);
        }
    }

    showMessage(msg, isError=false) {
        const messageDiv = document.getElementById("message");
        messageDiv.textContent = msg;
        messageDiv.style.display = "block";
        messageDiv.style.background = isError ? "#e74c3c" : "#2ecc71";
        messageDiv.style.color = "#fff";
        setTimeout(()=>{ messageDiv.style.display="none"; },3000);
    }
}
