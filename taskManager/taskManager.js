import { Profile } from "../profile/Profile.js";

function isReminderActive(dateString) {
    if (!dateString) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateString.startsWith(today);
}
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
        
        <div id="message"></div>
        
        <div class="form">
        <h4 class="panel-title">🗂️My Daily Remainder</h4>
            <input type="text" id="title" placeholder="Task Title">
            <input type="text" id="desc" placeholder="Task Description">
            <div class="date-wrapper">
                <input type="date" id="taskDate" class="hidden-date">
                <span class="date-icon" id="dateIcon">🗓️</span>
            </div>
            <button id="addBtn" class="add-btn"> + Add Task</button>
        </div>
        <ul id="taskList"></ul>
    `;

        document.getElementById("addBtn").addEventListener("click", () => this.addTask());

        
        const dateInput = document.getElementById("taskDate");
        const dateIcon = document.getElementById("dateIcon");
        dateIcon.addEventListener("click", () => dateInput.showPicker());
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
        <div id="task-inputs">
            <h5>${task.title}</h5>
            <p id="desc">${task.description || ""}</p>
            <p id="date" style="background:none; border:none; color:#1e3c72">🗓️ ${task.taskTime ? task.taskTime.substring(0, 10) : ""}</p>
        </div>
 ${isReminderActive(task.taskTime) ? `
            <div class="reminder-card">
                <span>📧 Reminder Active</span>
            </div>
        ` : ""}
        <div class="task-bottom">
            <div id="btns">
                <button class="update-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            </div>
        </div>

       
    `;
    
    li.querySelector(".update-btn").addEventListener("click", () => {
        const newTitle = prompt("Yeni başlık:", task.title);
        if (newTitle && newTitle.trim() !== "") {
            this.updateTask(task.id, task);
        }
    });

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
        const date = document.getElementById("taskDate").value;

        if (!title) {
            this.showMessage("Title is mandatory!", true);
            return;
        }

        if (!date) {
            this.showMessage("Please select a date for reminder!", true);
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8000/add?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&userId=${this.userId}&taskTime=${encodeURIComponent(date)}`
            );

            if (res.ok) {
                this.showMessage(" Task added! Reminder email will be sent on the selected date.");
                document.querySelectorAll("#title, #desc, #taskDate").forEach(el => {
                    el.classList.add("fade-out");
                    setTimeout(() => { el.value = ""; el.classList.remove("fade-out"); }, 300);
                });
                this.loadTasks();
            } else {
                this.showMessage("Failed to add task!", true);
            }
        } catch (err) {
            this.showMessage("Cannot connect to the server!", true);
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

    async updateTask(id, oldTask) {
        try {
            const newTitle = prompt("Yeni başlık:", oldTask.title);
            if (!newTitle || newTitle.trim() === "") return;

            const newDesc = prompt("Yeni açıklama:", oldTask.description || "");
            const newDate = prompt("Yeni tarih (yyyy-MM-dd):", oldTask.taskTime || "");

            const res = await fetch(
                `http://localhost:8000/update?id=${id}&title=${encodeURIComponent(newTitle)}&desc=${encodeURIComponent(newDesc)}&taskTime=${encodeURIComponent(newDate)}&userId=${this.userId}`
            );

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

    showMessage(msg, isError = false) {
        const messageDiv = document.getElementById("message");
        messageDiv.textContent = msg;
        messageDiv.style.display = "block";
        messageDiv.style.opacity = "1";
        messageDiv.style.background = isError ? "#e74c3c" : "#2ecc71";
        messageDiv.style.color = "#fff";
        messageDiv.classList.add("fade-in");
        setTimeout(() => {
            messageDiv.classList.remove("fade-in");
            messageDiv.classList.add("fade-out");
            setTimeout(() => { messageDiv.style.display = "none"; messageDiv.classList.remove("fade-out"); }, 600);
        }, 2500);
    }
    
}
