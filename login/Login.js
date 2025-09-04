export class Login {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <h1>Login</h1>
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="password" placeholder="Şifre">
            <button id="loginBtn">Giriş Yap</button>
            <div style="margin-top: 10px;">
                <button id="toRegisterBtn" style="background:none; border:none; color:#1e3c72; cursor:pointer;">Hesabın yok mu? Kayıt Ol</button>
            </div>
            <div id="message"></div>
        `;

        document.getElementById("loginBtn").addEventListener("click", () => this.loginUser());
        document.getElementById("toRegisterBtn").addEventListener("click", () => this.goToRegister());
    }

    async loginUser() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`http://localhost:8000/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
            if (res.ok) {
                const data = await res.json(); // { id: "userId", fullName: "Ad Soyad" }
                const userId = data.id;
                this.onSuccess(userId); // TaskManager componentine geçiş
            } else {
                this.showMessage("Email veya şifre yanlış!", true);
            }
        } catch (err) {
            this.showMessage("Sunucuya bağlanılamadı!", true);
            console.error(err);
        }
    }

    goToRegister() {
        // Container temizlenip Register componenti çağrılacak
        this.container.innerHTML = "";
        import("../register/register.js").then(module => {
            new module.Register(this.container, () => {
                // Register sonrası tekrar login açılacak
                this.render();
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
