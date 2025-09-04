export class TaskManager {
    constructor(container) {
        this.container = container;
        this.userId = sessionStorage.getItem("userId");
        this.render();
        this.loadTasks();
    }

    render() {
        this.container.innerHTML = `
            <h1>Task Manager</h1>
            <input type="text" id="title" placeholder="Task Title">
            <input type="text" id="desc" placeholder="Task Description">
            <button id="addBtn">Add Task</button>
            <div id="message"></div>
            <ul id="taskList"></ul>
        `;

        document.getElementById("addBtn").addEventListener("click", () => this.addTask());
    }

    async loadTasks() {
        try {
            const res = await fetch(`http://localhost:8000/tasks?userId=${this.userId}`);
            const tasks = await res.json();
            const list = document.getElementById("taskList");
            list.innerHTML = "";
            tasks.forEach(task => {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${task.title}</strong>: ${task.description} 
                                <button onclick="deleteTask(${task.id})">🗑️</button>`;
                list.appendChild(li);
            });
        } catch (err) {
            console.error(err);
        }
    }

    async addTask() {
        const title = document.getElementById("title").value;
        const desc = document.getElementById("desc").value;

        if (!title) return;

        try {
            const res = await fetch(`http://localhost:8000/add?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&userId=${this.userId}`);
            if (res.ok) this.loadTasks();
        } catch (err) {
            console.error(err);
        }
    }
}
