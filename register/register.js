export class Register {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <h1>Kayıt Ol</h1>
            <input type="text" id="fullName" placeholder="Ad Soyad">
            <input type="text" id="phone" placeholder="Telefon">
            <input type="text" id="gender" placeholder="Cinsiyet">
            <input type="text" id="address" placeholder="Adres">
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="password" placeholder="Şifre">
            <button id="registerBtn">Kayıt Ol</button>
            <div style="margin-top: 10px;">
                <button id="toLoginBtn" style="background:none; border:none; color:#1e3c72; cursor:pointer;">
                    Zaten hesabım var? Giriş Yap
                </button>
            </div>
            <div id="message"></div>
        `;

        document.getElementById("registerBtn").addEventListener("click", () => this.registerUser());
        document.getElementById("toLoginBtn").addEventListener("click", () => this.goToLogin());
    }

    async registerUser() {
        const data = {
            fullName: document.getElementById("fullName").value,
            phone: document.getElementById("phone").value,
            gender: document.getElementById("gender").value,
            address: document.getElementById("address").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        try {
            const res = await fetch(`http://localhost:8000/register?fullName=${encodeURIComponent(data.fullName)}&phone=${encodeURIComponent(data.phone)}&gender=${encodeURIComponent(data.gender)}&address=${encodeURIComponent(data.address)}&email=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}`);

            if (res.ok) {
                this.showMessage("Kayıt başarılı!");
                this.onSuccess();
            } else {
                this.showMessage("Kayıt başarısız!", true);
            }
        } catch (err) {
            this.showMessage("Sunucuya bağlanılamadı!", true);
        }
    }

    goToLogin() {
        this.container.innerHTML = "";
        import("../login/Login.js").then(module => {
            new module.Login(this.container, (userId) => {
                import("../taskManager/taskManager.js").then(tmModule => {
                    window.taskManager = new tmModule.TaskManager(document.getElementById("taskContainer"), document.getElementById("profileContainer"), userId);
                });
            });
        });
    }

    showMessage(msg, isError = false) {
        const messageDiv = document.getElementById("message");
        messageDiv.textContent = msg;
        messageDiv.style.display = "block";
        messageDiv.style.background = isError ? "#e74c3c" : "#2ecc71";
        messageDiv.style.color = "#fff";
        setTimeout(() => { messageDiv.style.display = "none"; }, 3000);
    }
}
