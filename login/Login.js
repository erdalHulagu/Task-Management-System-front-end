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
            <div id="message"></div>
        `;

        document.getElementById("loginBtn").addEventListener("click", () => this.loginUser());
    }

    async loginUser() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`http://localhost:8000/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
            if (res.ok) {
                const data = await res.json();
                sessionStorage.setItem("userId", data.id);
                this.onSuccess(); // Task Manager componentine geçiş
            } else {
                document.getElementById("message").textContent = "❌ Geçersiz email veya şifre!";
            }
        } catch (err) {
            document.getElementById("message").textContent = "❌ Sunucuya bağlanılamadı!";
        }
    }
}
