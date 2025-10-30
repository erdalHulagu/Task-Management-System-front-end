export class Admin {
    constructor(container, onSuccess,userId) {
        this.container = container;
        this.onSuccess = onSuccess;
        this.render();
    };