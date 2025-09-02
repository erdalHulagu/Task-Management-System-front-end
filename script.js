// Mesaj kutusu
function showMessage(text, type) {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.className = type;
    msg.style.display = "block";
    setTimeout(() => msg.style.display = "none", 3000);
}

// Görevleri yükle
async function loadTasks() {
    try {
        const res = await fetch("http://localhost:8000/tasks");
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
                    <button class="update-btn" onclick="updateTask(${task.id}, '${task.title}', '${task.description}')">✏️</button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
                </div>
            `;

            list.appendChild(li);
        });
    } catch (err) {
        showMessage("Görevler yüklenemedi!", "error");
        console.error(err);
    }
}

// Yeni görev ekle
async function addTask() {
    const title = document.getElementById("title").value.trim();
    const desc = document.getElementById("desc").value.trim();

    if (!title || !desc) {
        showMessage("Lütfen tüm alanları doldurun!", "error");
        return;
    }

    try {
        const res = await fetch(`http://localhost:8000/add?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}`);
        if (res.ok) {
            showMessage("Görev eklendi!", "success");
            document.getElementById("title").value = "";
            document.getElementById("desc").value = "";
            loadTasks();
        } else {
            showMessage("Görev eklenemedi!", "error");
        }
    } catch (err) {
        showMessage("Sunucuya bağlanılamadı!", "error");
    }
}

// Görev sil
async function deleteTask(id) {
    try {
        const res = await fetch(`http://localhost:8000/delete?id=${id}`);
        if (res.ok) {
            showMessage("Görev silindi!", "success");
            loadTasks();
        } else {
            showMessage("Görev silinemedi!", "error");
        }
    } catch (err) {
        showMessage("Sunucuya bağlanılamadı!", "error");
    }
}

// Görev güncelle
async function updateTask(id, oldTitle, oldDesc) {
    const newTitle = prompt("Yeni başlık:", oldTitle);
    const newDesc = prompt("Yeni açıklama:", oldDesc);

    if (!newTitle || !newDesc) {
        showMessage("Güncelleme iptal edildi.", "error");
        return;
    }

    try {
        const res = await fetch(`http://localhost:8000/update?id=${id}&title=${encodeURIComponent(newTitle)}&desc=${encodeURIComponent(newDesc)}`);
        if (res.ok) {
            showMessage("Görev güncellendi!", "success");
            loadTasks();
        } else {
            showMessage("Görev güncellenemedi!", "error");
        }
    } catch (err) {
        showMessage("Sunucuya bağlanılamadı!", "error");
    }
}

// Sayfa açılınca görevleri yükle
window.onload = loadTasks;
