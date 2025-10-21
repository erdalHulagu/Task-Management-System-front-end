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

                <div style="margin-top: 20px; display:flex; gap:10px;">
                    <button id="logoutBtn" style="flex:1; background:#1e3c72; color:white; padding:8px; border-radius:6px; border:none; cursor:pointer;">Exit Profile</button>
                    <button id="deleteAccountBtn" style="flex:1; background:#d32f2f; color:white; padding:8px; border-radius:6px; border:none; cursor:pointer;">Delete Account</button>
                </div>

                <div id="message" style="margin-top:10px; color:red;"></div>
            </div>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("userId");
            window.location.reload();
        });

        document.getElementById("deleteAccountBtn").addEventListener("click", () => {
            this.deleteAccount(); // constructor’dan gelen userId kullanılacak
        });
    }

    async loadUser() {
    try {
        // 🔹 Burada userId'yi localStorage'dan alıyoruz (eklenen satır)
        this.userId = localStorage.getItem("userId");

if (!this.userId) {
    console.warn("User ID not found in localStorage — skipping profile load.");
    return;
}


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
    } catch (err) {
        console.error(err);
        ["fullName", "phone", "gender", "address", "email"].forEach(f => {
            document.getElementById(f).textContent = "Yüklenemedi";
        });
    }
}


    makeEditable(span, field) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = span.textContent;
        input.className = "inline-edit";
        span.replaceWith(input);
        input.focus();

        const save = async () => {
            const newValue = input.value.trim();
            if (!newValue) return;

            try {
                const res = await fetch(`http://localhost:8000/updateUser?id=${this.userId}&field=${field}&value=${encodeURIComponent(newValue)}`);
                if (res.ok) {
                    span.textContent = newValue;
                    input.replaceWith(span);
                } else {
                    alert("Güncelleme başarısız!");
                    input.replaceWith(span);
                }
            } catch (err) {
                alert("Sunucuya bağlanılamadı!");
                input.replaceWith(span);
            }
        };

        input.addEventListener("blur", save);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") input.blur();
        });
    }
async deleteAccount() {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone!");
    if (!confirmDelete) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
        console.warn("User ID not found in localStorage — probably not logged in.");
        return; 
    }


    try {
        const res = await fetch(`http://localhost:8000/deleteUser?id=${this.userId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            alert("Your account has been deleted successfully.");
            localStorage.removeItem("userId");
            window.location.reload();
        } else {
            const msg = await res.text();
            alert("Failed to delete account: " + msg);
        }
    } catch (err) {
        console.error(err);
        alert("Server connection failed!");
    }
}



}
