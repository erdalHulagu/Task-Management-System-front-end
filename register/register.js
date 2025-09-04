export class Register {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <h1>Register</h1>
            <input type="text" id="fullName" placeholder="Ad Soyad">
            <input type="text" id="phone" placeholder="Telefon">
            <input type="text" id="gender" placeholder="Cinsiyet">
            <input type="text" id="address" placeholder="Adres">
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="password" placeholder="Şifre">
            <button id="registerBtn">Kayıt Ol</button>
            <div id="message"></div>
        `;

        document.getElementById("registerBtn").addEventListener("click", () => this.registerUser());
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
                document.getElementById("message").textContent = "✅ Kayıt başarılı!";
                this.onSuccess(); // Login componentine geçiş
            } else {
                document.getElementById("message").textContent = "❌ Kayıt başarısız!";
            }
        } catch (err) {
            document.getElementById("message").textContent = "❌ Sunucuya bağlanılamadı!";
        }
    }
}
