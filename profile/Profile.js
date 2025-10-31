import {showCustomConfirm} from "../taskManager/taskManager.js"
export class Profile {
    constructor(container, userId) {
        this.container = container;
        this.userId = userId;
        this.render();
        this.loadUser();
    }

    render() {
        this.container.innerHTML = `
            <div class="profile-panel">
                <h2>Profil</h2>

                <!-- Profil alanları -->
                <div id="profileFields">
                    <div class="profile-field">
                        <span>Full Name:</span>
                        <span class="editable" id="fullName">Yükleniyor...</span>
                    </div>
                    <div class="profile-field">
                        <span>Phone:</span>
                        <span class="editable" id="phone">Yükleniyor...</span>
                    </div>
                    <div class="profile-field">
                        <span>Gender:</span>
                        <span class="editable" id="gender">Yükleniyor...</span>
                    </div>
                    <div class="profile-field">
                        <span>Address:</span>
                        <span class="editable" id="address">Yükleniyor...</span>
                    </div>
                    <div class="profile-field">
                        <span>Email:</span>
                        <span id="email">Yükleniyor...</span>
                    </div>

                    <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; gap: 20px;">
                        <button  id="logoutBtn">Exit Profile</button>
                        <span id="deleteAccountBtn">Delete Account</span>
                    </div>

                    <div id="message"></div>
                </div>

                <!-- ADMIN PANEL -->
                <div id="adminPanelContainer" style="margin-top:20px; display:none; flex-direction:column; gap:10px;">
                    <button id="showUsersBtn" >
                        👥 View All Users
                    </button>

                    <div id="userListSection" style="display:none; flex-direction:column; gap:10px;">
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                        <div id="backToProfileBtn">⟵</div>
                            <h5 style="color:#1e3c72; ">All Users</h4>
                            
                        </div>
                        <div id="userList" style="margin-top:10px; display:flex; flex-direction:column; gap:8px;"></div>
                    </div>
                    
                </div>
            </div>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("userId");
            window.location.reload();
        });

        document.getElementById("deleteAccountBtn").addEventListener("click", () => {
            this.deleteAccount();
        });

        const showUsersBtn = document.getElementById("showUsersBtn");
        if (showUsersBtn) showUsersBtn.addEventListener("click", () => this.toggleUserList());

        const backToProfileBtn = document.getElementById("backToProfileBtn");
        if (backToProfileBtn) backToProfileBtn.addEventListener("click", () => this.showProfile());
    }

    async loadUser() {
        try {
            this.userId = localStorage.getItem("userId");
            if (!this.userId) return;

            const res = await fetch(`http://localhost:8000/user?id=${this.userId}`);
            if (!res.ok) throw new Error("Kullanıcı bulunamadı");
            const user = await res.json();

            console.log("Loaded user:", user);

            ["fullName", "phone", "gender", "address"].forEach(field => {
                const span = document.getElementById(field);
                span.textContent = user[field] || "";
                span.addEventListener("click", () => this.makeEditable(span, field));
            });
            document.getElementById("email").textContent = user.email || "";

            // ADMIN PANEL GÖSTER
            if (user.isAdmin) document.getElementById("adminPanelContainer").style.display = "flex";

        } catch (err) {
            console.error(err);
            ["fullName", "phone", "gender", "address", "email"].forEach(f => {
                document.getElementById(f).textContent = "Yüklenemedi";
            });
        }
    }

    makeEditable(span, field) {
        if (field === "gender") {
            const container = document.createElement("div");
            container.className = "inline-edit-gender";

            const mrLabel = document.createElement("label");
            const mrInput = document.createElement("input");
            mrInput.type = "radio"; mrInput.name = "editGender"; mrInput.value = "Mr";
            if (span.textContent === "Mr") mrInput.checked = true;
            mrLabel.appendChild(mrInput); mrLabel.appendChild(document.createTextNode(" Mr "));

            const msLabel = document.createElement("label");
            const msInput = document.createElement("input");
            msInput.type = "radio"; msInput.name = "editGender"; msInput.value = "Ms";
            if (span.textContent === "Ms") msInput.checked = true;
            msLabel.appendChild(msInput); msLabel.appendChild(document.createTextNode(" Ms "));

            container.appendChild(mrLabel); container.appendChild(msLabel);
            span.replaceWith(container);

            const save = async (newValue) => {
                try {
                    const res = await fetch(`http://localhost:8000/updateUser?id=${this.userId}&field=${field}&value=${encodeURIComponent(newValue)}`);
                    if (res.ok) { span.textContent = newValue; container.replaceWith(span); }
                    else { alert("Güncelleme başarısız!"); container.replaceWith(span); }
                } catch { container.replaceWith(span); }
            };

            container.querySelectorAll("input[name='editGender']").forEach(input => {
                input.addEventListener("change", () => save(input.value));
            });
            return;
        }

        const input = document.createElement("input");
        input.type = "text"; input.value = span.textContent; input.className = "inline-edit";
        span.replaceWith(input); input.focus();

        const save = async () => {
            const newValue = input.value.trim();
            if (!newValue) return;

            try {
                const res = await fetch(`http://localhost:8000/updateUser?id=${this.userId}&field=${field}&value=${encodeURIComponent(newValue)}`);
                if (res.ok) { span.textContent = newValue; input.replaceWith(span); }
                else { alert("Güncelleme başarısız!"); input.replaceWith(span); }
            } catch { input.replaceWith(span); }
        };

        input.addEventListener("blur", save);
        input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
    }

    async deleteAccount() {
    const confirmed = await showCustomConfirm("Are you sure you want to delete your account?");
    if (!confirmed) return;

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const res = await fetch(`http://localhost:8000/deleteUser?id=${this.userId}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
        if (res.ok) { alert("Account deleted"); localStorage.removeItem("userId"); window.location.reload(); }
        else { alert("Failed to delete account"); }
    } catch { alert("Server connection failed"); }
}

    // ADMIN FEATURE
    async toggleUserList() {
        const profileFields = document.getElementById("profileFields");
        const userListSection = document.getElementById("userListSection");
        const userList = document.getElementById("userList");

        profileFields.style.display = "none";
        userListSection.style.display = "flex";

        try {
            const res = await fetch("http://localhost:8000/users");
            if (!res.ok) throw new Error("Could not load users");
            const users = await res.json();

            userList.innerHTML = "";
            users.forEach(u => {
                const div = document.createElement("div");
                div.className = "profile-field"; // CSS uyumlu
                div.style.justifyContent = "space-between";
                div.innerHTML = `
                    <span>${u.fullName} (${u.email})</span>
                    <button class="deleteUserBtn">🗑️</button>
                `;
               div.querySelector(".deleteUserBtn").addEventListener("click", async () => {
               const confirmed = await showCustomConfirm("Delete " + u.fullName + "?");
               if (!confirmed) return;
               await this.deleteUser(u.id);
               await this.toggleUserList(); // listeyi yenile
});
                userList.appendChild(div);
            });
        } catch (err) { alert("Error loading users: " + err.message); }
    }

    showProfile() {
        document.getElementById("userListSection").style.display = "none";
        document.getElementById("profileFields").style.display = "block";
    }

    async deleteUser(userId) {
        try {
            const res = await fetch(`http://localhost:8000/deleteUser?id=${userId}`, { method: "DELETE" });
            if (res.ok) alert("User deleted");
            else alert("Failed to delete user");
        } catch (err) { alert("Server error: " + err.message); }
    }
}
