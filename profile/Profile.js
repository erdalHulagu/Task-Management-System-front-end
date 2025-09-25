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
                <h2>Profil Bilgileri</h2>
                <div class="profile-field">
                    <span>Ad Soyad:</span>
                    <span class="editable" id="fullName">Yükleniyor...</span>
                </div>
                <div class="profile-field">
                    <span>Telefon:</span>
                    <span class="editable" id="phone">Yükleniyor...</span>
                </div>
                <div class="profile-field">
                    <span>Cinsiyet:</span>
                    <span class="editable" id="gender">Yükleniyor...</span>
                </div>
                <div class="profile-field">
                    <span>Adres:</span>
                    <span class="editable" id="address">Yükleniyor...</span>
                </div>
                <div class="profile-field">
                    <span>Email:</span>
                    <span id="email">Yükleniyor...</span>
                </div>
                <button id="logoutBtn">Çıkış Yap</button>
            </div>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("userId");
            window.location.reload();
        });
    }

    async loadUser() {
        try {
            const res = await fetch(`http://localhost:8000/user?id=${this.userId}`);
            if (!res.ok) throw new Error("Kullanıcı bulunamadı");
            const user = await res.json();

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
}
