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
            if(res.ok){
                const data = await res.json(); // { id: "userId", fullName: "Ad Soyad" }
                this.onSuccess(data.id); // TaskManager componentine userId gönder
            } else {
                this.showMessage("Email veya şifre yanlış!", true);
            }
        } catch(err) {
            this.showMessage("Sunucuya bağlanılamadı!", true);
        }
    }

    showMessage(msg, isError=false){
        const messageDiv = document.getElementById("message");
        messageDiv.textContent = msg;
        messageDiv.style.color = isError ? "red" : "green";
    }
}
