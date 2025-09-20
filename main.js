import { Login } from "./login/Login.js";
import { Register } from "./register/register.js";
import { TaskManager } from "./taskManager/task-manager.js";

const profileContainer = document.getElementById("profileContainer");
const taskContainer = document.getElementById("taskContainer");

const savedUserId = localStorage.getItem("userId");

if (savedUserId) {
    // Daha önce giriş yapıldıysa direkt TaskManager aç
    new TaskManager(taskContainer, savedUserId);
    // Profil bilgilerini de yüklemek için Login yerine Profile component eklenebilir
} else {
    // Önce register göster
    new Register(profileContainer, () => {
        // Kayıt başarılıysa login göster
        new Login(profileContainer, (userId) => {
            localStorage.setItem("userId", userId);
            new TaskManager(taskContainer, userId);
        });
    });
}
