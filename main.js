import { Login } from "./login/Login.js";
import { TaskManager } from "./taskManager/taskManager.js"
import { Profile } from "./profile/Profile.js";
import { Register } from "./register/Register.js";

const profileContainer = document.getElementById("profileContainer");
const taskContainer = document.getElementById("taskContainer");

const savedUserId = localStorage.getItem("userId");

if (savedUserId) {
    // Daha önce giriş yapılmışsa TaskManager ve Profile aç
    initApp(savedUserId);
} else {
    // Önce Register göster
    new Register(profileContainer, () => {
        new Login(profileContainer, (userId) => {
            localStorage.setItem("userId", userId);
            initApp(userId);
        });
    });
}

async function initApp(userId) {
    // Profile'ı yükle
    const profile = new Profile(profileContainer, userId);
    // TaskManager'ı yükle
    window.taskManager = new TaskManager(taskContainer, profileContainer, userId);
}
