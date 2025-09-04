export class TaskManager {
    constructor(container, userId) {
        this.container = container;
        this.userId = userId;
        this.render();
    }

    render() {
        this.container.innerHTML = `
        <div class="container" id="taskContainer">
            <div class="profile-panel">
                <h2>Profil Bilgileri</h2>
                <div class="profile-field">
                    <span>Ad Soyad:</span>
                    <span id="fullName"></span>
                    <button class="edit-btn" data-field="fullName">✏️</button>
                </div>
                <div class="profile-field">
                    <span>Telefon:</span>
                    <span id="phone"></span>
                    <button class="edit-btn" data-field="phone">✏️</button>
                </div>
                <div class="profile-field">
                    <span>Cinsiyet:</span>
                    <span id="gender"></span>
                    <button class="edit-btn" data-field="gender">✏️</button>
                </div>
                <div class="profile-field">
                    <span>Adres:</span>
                    <span id="address"></span>
                    <button class="edit-btn" data-field="address">✏️</button>
                </div>
                <div class="profile-field">
                    <span>Email:</span>
                    <span id="email"></span>
                </div>
                <button id="logoutBtn">Çıkış Yap</button>
            </div>

            <div class="tasks-panel">
                <h2>My Tasks</h2>
                <div id="message"></div>
                <div class="form">
                    <input type="text" id="title" placeholder="Task Title">
                    <input type="text" id="desc" placeholder="Task Description">
                    <button id="addBtn">Add Task</button>
                </div>
                <ul id="taskList"></ul>
            </div>
        </div>
        `;

        this.init();
    }

    init() {
        this.loadUser();
        this.loadTasks();
        document.getElementById("addBtn").addEventListener("click", () => this.addTask());
        document.getElementById("logoutBtn").addEventListener("click", () => window.location.href = "../index.html");

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => this.updateUserField(btn.dataset.field));
        });
    }

    async loadUser() {
        try {
            const res = await fetch(`http://localhost:8000/user?id=${this.userId}`);
            if (res.ok) {
                const user = await res.json();
                document.getElementById("fullName").textContent = user.fullName;
                document.getElementById("phone").textContent = user.phone;
                document.getElementById("gender").textContent = user.gender;
                document.getElementById("address").textContent = user.address;
                document.getElementById("email").textContent = user.email;
            }
        } catch (err) { console.error(err); }
    }

    async updateUserField(field) {
        const currentValue = document.getElementById(field).textContent;
        const newValue = prompt(`Yeni ${field} giriniz:`, currentValue);
        if (!newValue) return;

        try {
            const res = await fetch(`http://localhost:8000/updateUser?id=${this.userId}&field=${field}&value=${encodeURIComponent(newValue)}`);
            if (res.ok) document.getElementById(field).textContent = newValue;
            else this.showMessage("Güncelleme başarısız!", true);
        } catch (err) { this.showMessage("Sunucuya bağlanılamadı!", true); }
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
                        <p>${task.description}</p>
                    </div>
                    <div>
                        <button class="update-btn" onclick="window.taskManager.updateTask(${task.id}, '${task.title}', '${task.description}')">✏️</button>
                        <button class="delete-btn" onclick="window.taskManager.deleteTask(${task.id})">🗑️</button>
                    </div>
                `;
                list.appendChild(li);
            });
        } catch (err) { this.showMessage("Görevler yüklenemedi!", true); }
    }

    async addTask() {
        const title = document.getElementById("title").value.trim();
        const desc = document.getElementById("desc").value.trim();
        if (!title) { this.showMessage("Title zorunlu!", true); return; }

        try {
            const res = await fetch(`http://localhost:8000/add?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&userId=${this.userId}`);
            if (res.ok) {
                this.showMessage("Görev eklendi!");
                document.getElementById("title").value = "";
                document.getElementById("desc").value = "";
                this.loadTasks();
            } else this.showMessage("Görev eklenemedi!", true);
        } catch (err) { this.showMessage("Sunucuya bağlanılamadı!", true); }
    }

    async deleteTask(id) {
        try {
            const res = await fetch(`http://localhost:8000/delete?id=${id}&userId=${this.userId}`);
            if (res.ok) { this.showMessage("Görev silindi!"); this.loadTasks(); }
            else this.showMessage("Görev silinemedi!", true);
        } catch (err) { this.showMessage("Sunucuya bağlanılamadı!", true); }
    }

    async updateTask(id, oldTitle, oldDesc) {
        const newTitle = prompt("Yeni başlık:", oldTitle);
        const newDesc = prompt("Yeni açıklama:", oldDesc);
        if (!newTitle) { this.showMessage("Güncelleme iptal edildi.", true); return; }

        try {
            const res = await fetch(`http://localhost:8000/update?id=${id}&title=${encodeURIComponent(newTitle)}&desc=${encodeURIComponent(newDesc)}&userId=${this.userId}`);
            if (res.ok) { this.showMessage("Görev güncellendi!"); this.loadTasks(); }
            else this.showMessage("Görev güncellenemedi!", true);
        } catch (err) { this.showMessage("Sunucuya bağlanılamadı!", true); }
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

// Global referans (updateTask ve deleteTask butonları için)
window.taskManager = null;
