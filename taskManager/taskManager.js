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
    
   li.querySelector(".update-btn").addEventListener("click", async () => {
    const newTitle = await showCustomPrompt("Yeni başlık:", task.title);
    if (!newTitle || newTitle.trim() === "") return;

    const newDesc = await showCustomPrompt("Yeni açıklama:", task.description || "");
    const newDate = await showCustomPrompt("Yeni tarih (yyyy-MM-dd):", task.taskTime || "");

    this.updateTask(task.id, newTitle, newDesc, newDate);
});


   li.querySelector(".delete-btn").addEventListener("click", async () => {
    const confirmed = await showCustomConfirm("Bu görevi silmek istediğine emin misin?");
    if (confirmed) {
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

   async updateTask(id, newTitle, newDesc, newDate) {
    try {
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




function isReminderActive(dateString) {
    if (!dateString) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateString.startsWith(today);
}


async function showCustomPrompt(label, oldValue = "") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-prompt-overlay";

    // Tarih mi istiyoruz?
    const isDate = label.toLowerCase().includes("tarih");

    overlay.innerHTML = `
      <div class="custom-prompt-box">
        <h3>${label}</h3>
        ${
          isDate
            ? `
          <div class="date-wrapper">
            <input type="date" id="customPromptInput" class="hidden-date" value="${oldValue ? oldValue.substring(0,10) : ""}">
            <span class="date-icon" id="promptDateIcon">🗓️</span>
          </div>
        `
            : `<input type="text" id="customPromptInput" value="${oldValue}" />`
        }
        <div class="prompt-buttons">
          <button id="okBtn">Tamam</button>
          <button id="cancelBtn">İptal</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Tarih picker’ını ikonla aç
    if (isDate) {
      const input = overlay.querySelector("#customPromptInput");
      const icon = overlay.querySelector("#promptDateIcon");
      icon.addEventListener("click", () => input.showPicker());
    }

    overlay.querySelector("#okBtn").addEventListener("click", () => {
      const value = overlay.querySelector("#customPromptInput").value.trim();
      overlay.remove();
      resolve(value || null);
    });

    overlay.querySelector("#cancelBtn").addEventListener("click", () => {
      overlay.remove();
      resolve(null);
    });
  });
}


async function showCustomConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-prompt-overlay";

    overlay.innerHTML = `
      <div class="custom-prompt-box">
        <h3>⚠️ Onay Gerekli</h3>
        <p style="margin-bottom: 20px; color:#243042;">${message}</p>
        <div class="prompt-buttons">
          <button id="confirmOkBtn">Evet</button>
          <button id="confirmCancelBtn">Hayır</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("confirmOkBtn").addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });

    document.getElementById("confirmCancelBtn").addEventListener("click", () => {
      overlay.remove();
      resolve(false);
    });
  });
}
export { showCustomConfirm };
export { showCustomPrompt};