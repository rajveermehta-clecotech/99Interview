// js/form-handler.js
class FormHandler {
    constructor(navigation) {
        this.navigation = navigation;
        this.bindEvents();
    }

    bindEvents() {
        // User info form
        document.getElementById('user-info-form').addEventListener('submit', (e) => {
            this.handleUserInfoSubmit(e);
        });

        // Real-time validation for user name
        document.getElementById('user-name').addEventListener('input', (e) => {
            this.validateUserName(e.target);
        });
    }

    handleUserInfoSubmit(e) {
        e.preventDefault();

        const nameInput = document.getElementById('user-name');
        const name = nameInput.value.trim();

        if (this.validateUserName(nameInput)) {
            // Save user name
            Storage.save('userName', name);

            // Proceed to questions
            this.navigation.showScreen('questions-screen');
        }
    }

    validateUserName(input) {
        const name = input.value.trim();
        const errorDiv = document.getElementById('name-error');

        let isValid = true;
        let errorMessage = '';

        if (!name) {
            isValid = false;
            errorMessage = 'Name is required';
        } else if (name.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters long';
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            isValid = false;
            errorMessage = 'Name can only contain letters and spaces';
        }

        if (!isValid) {
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('show');
            input.style.borderColor = 'var(--error-color)';
        } else {
            errorDiv.classList.remove('show');
            input.style.borderColor = '';
        }

        return isValid;
    }
}