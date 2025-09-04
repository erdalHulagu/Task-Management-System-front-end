import { Login } from "./login/Login.js";
import { Register } from "./register/register.js";
import { TaskManager } from "./taskManager/task-manager.js";

const container = document.getElementById("mainContainer");

// Burada bir "localStorage" kontrolü ile örnek olarak login durumunu saklayabiliriz
const savedUserId = localStorage.getItem("userId");

if (savedUserId) {
    // Eğer daha önce login olmuşsa direkt TaskManager aç
    new TaskManager(container, savedUserId);
} else {
    // Önce register göster
    new Register(container, () => {
        // Register başarılıysa login göster
        new Login(container, (userId) => {
            // Login başarılıysa TaskManager aç
            localStorage.setItem("userId", userId); // Login durumunu sakla
            new TaskManager(container, userId);
        });
    });
}
