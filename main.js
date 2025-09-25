import { Login } from "./login/Login.js";
import { Register } from "./register/Register.js";
import { TaskManager } from "./taskManager/TaskManager.js";

const profileContainer = document.getElementById("profileContainer");
const taskContainer = document.getElementById("taskContainer");

const savedUserId = localStorage.getItem("userId");

if (savedUserId) {

    window.taskManager = new TaskManager(taskContainer, profileContainer, savedUserId);
     new Profile(profileContainer, savedUserId);
    new TaskManager(taskContainer, savedUserId);
} else {
    new Register(profileContainer, () => {
        new Login(profileContainer, (userId) => {
            localStorage.setItem("userId", userId);
            window.taskManager = new TaskManager(taskContainer, profileContainer, userId);
        });
    });
}
