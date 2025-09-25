export class Profile {
    constructor(container, userId) {
        this.container = container;
        this.userId = userId;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <h2>Profil Bilgileri</h2>
            <div class="profile-field">
                <span>Ad Soyad:</span>
                <span id="fullName" class="editable"></span>
            </div>
            <div class="profile-field">
                <span>Telefon:</span>
                <span id="phone" class="editable"></span>
            </div>
            <div class="profile-field">
                <span>Cinsiyet:</span>
                <span id="gender" class="editable"></span>
            </div>
            <div class="profile-field">
                <span>Adres:</span>
                <span id="address" class="editable"></span>
            </div>
            <div class="profile-field">
                <span>Email:</span>
                <span id="email"></span>
            </div>
            <button id="logoutBtn">Çıkış Yap</button>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("userId");
            window.location.reload();
        });

        this.loadUser();
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

                this.initEditableFields();
            }
        } catch (err) {
            console.error(err);
        }
    }

    initEditableFields() {
        document.querySelectorAll(".editable").forEach(span => {
            span.addEventListener("click", () => {
                const currentValue = span.textContent;
                const input = document.createElement("input");
                input.type = "text";
                input.value = currentValue;
                input.id = span.id;
                input.className = "inline-input";

                span.replaceWith(input);
                input.focus();

                input.addEventListener("blur", async () => {
                    const newValue = input.value.trim();
                    const field = input.id;

                    try {
                        const res = await fetch(`http://localhost:8000/updateUser?id=${this.userId}&field=${field}&value=${encodeURIComponent(newValue)}`);
                        if (res.ok) {
                            const newSpan = document.createElement("span");
                            newSpan.id = field;
                            newSpan.className = "editable";
                            newSpan.textContent = newValue;
                            input.replaceWith(newSpan);
                            this.initEditableFields();
                        } else {
                            alert("Güncelleme başarısız!");
                            input.replaceWith(span);
                        }
                    } catch (err) {
                        alert("Sunucuya bağlanılamadı!");
                        input.replaceWith(span);
                    }
                });
            });
        });
    }
}
