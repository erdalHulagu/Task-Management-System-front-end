

import { Login } from "./login/Login.js";
import { Register } from "./register/register.js";
import {TaskManager} from './taskManager/task-manager.js'

const container = document.getElementById("mainContainer");

// Önce register göster
new Register(container, () => {
    // Register başarılıysa login göster
    new Login(container, (userId) => {
        // Login başarılıysa task manager göster
        new TaskManager(container, userId);
    });
});
