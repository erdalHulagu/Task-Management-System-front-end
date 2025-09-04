import { Login } from "./login/Login";
import { Register } from "./register/register";
import { TaskManager } from "./taskManager/task-manager";

const container = document.getElementById("mainContainer");

// Önce register göster
new Register(container, () => {
    // Register başarılıysa login göster
    new Login(container, () => {
        // Login başarılıysa task manager göster
        new TaskManager(container);
    });
});
