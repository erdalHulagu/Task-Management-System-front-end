export class Register {
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        this.step = 1;
        this.email = "";
        this.renderStep1();
    }

   renderStep1() {
    this.container.innerHTML = `
        <h1>Register</h1>
        <input type="text" id="fullName" placeholder="Full Name">
        <input type="text" id="phone" placeholder="Phone">

        <input type="text" id="address" placeholder="Address">
        <input type="email" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Password">
<div class="gender-group">
            <label>Gender</label>
            <div class="gender-options">
                <label>
                    <input type="radio" name="gender" value="Mr">
                    <span>Mr</span>
                </label>
                <label>
                    <input type="radio" name="gender" value="Ms">
                    <span>Ms</span>
                </label>
            </div>
        </div>
        <button id="sendCodeBtn">Send Verification Code</button>

        <div style="margin-top: 10px;">
            <button id="toLoginBtn" style="background:none; border:none; color:#1e3c72; cursor:pointer;">
                Already have an account? Sign in
            </button>
        </div>

        <div id="message"></div>
    `;

    // Eski 'gender' input'unu kaldırdık, onun yerine radio seçimi var



        document.getElementById("sendCodeBtn").addEventListener("click", () => this.sendVerificationCode());
        document.getElementById("toLoginBtn").addEventListener("click", () => this.goToLogin());
    }

    renderStep2() {
        this.container.innerHTML = `
            <h1>Email Doğrulama</h1>
            <p style="color:#1e3c72;">${this.email} adresine bir doğrulama kodu gönderildi.</p>
            <input type="text" id="code" placeholder="6 Haneli Kod">
            <button id="verifyBtn">Kodu Doğrula ve Kaydol</button>
            <div id="message"></div>
        `;

        document.getElementById("verifyBtn").addEventListener("click", () => this.verifyCode());
    }

    async sendVerificationCode() {
        const data = {
            fullName: document.getElementById("fullName").value,
            phone: document.getElementById("phone").value,
           gender: document.querySelector('input[name="gender"]:checked')?.value || "",
            address: document.getElementById("address").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        if (!data.email || !data.password || !data.fullName) {
            this.showMessage("Lütfen gerekli alanları doldurun!", true);
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/Register?action=sendCode&email=${encodeURIComponent(data.email)}`);
            if (res.ok) {
                this.showMessage("Doğrulama kodu gönderildi!");
                this.email = data.email;
                this.userData = data;
                this.step = 2;
                setTimeout(() => this.renderStep2(), 1000);
            } else {
                const text = await res.text();
                this.showMessage("Kod gönderilemedi: " + text, true);
            }
        } catch (err) {
            this.showMessage("Sunucuya bağlanılamadı!", true);
        }
    }

    async verifyCode() {
        const code = document.getElementById("code").value;

        try {
            const res = await fetch(`http://localhost:8000/Register?action=verify&email=${encodeURIComponent(this.email)}&code=${encodeURIComponent(code)}`);
            if (res.ok) {
                // Kod doğru → register yap
                const u = this.userData;
                const registerRes = await fetch(`http://localhost:8000/Register?action=register&fullName=${encodeURIComponent(u.fullName)}&phone=${encodeURIComponent(u.phone)}&gender=${encodeURIComponent(u.gender)}&address=${encodeURIComponent(u.address)}&email=${encodeURIComponent(u.email)}&password=${encodeURIComponent(u.password)}`);

                if (registerRes.ok) {
                    this.showMessage("Kayıt tamamlandı!");
                    setTimeout(() => this.onSuccess(), 1500);
                } else {
                    const text = await registerRes.text();
                    this.showMessage("Kayıt sırasında hata: " + text, true);
                }
            } else {
                const text = await res.text();
                this.showMessage("Kod hatalı: " + text, true);
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
