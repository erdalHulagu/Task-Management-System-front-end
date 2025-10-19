export class Login {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <h1>Sign-in</h1>
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="password" placeholder="Password">
            <button id="loginBtn">sign in</button>
            <div style="margin-top: 10px;">
                <button id="toRegisterBtn" style="background:none; border:none; color:#1e3c72; cursor:pointer;">
                    Don't you have an account? Get registered
                </button>
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
                const data = await res.json();
                this.onSuccess(data.id);
            } else {
                this.showMessage("Email veya şifre yanlış!", true);
            }
        } catch (err) {
            this.showMessage("Sunucuya bağlanılamadı!", true);
        }
    }

    goToRegister() {
        this.container.innerHTML = "";
        import("../register/Register.js").then(module => {
            new module.Register(this.container, () => this.render());
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
