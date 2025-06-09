// js/app.js
class App {
    constructor() {
        this.navigation = null;
        this.formHandler = null;
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        // Initialize navigation
        this.navigation = new Navigation();

        // Initialize form handler
        this.formHandler = new FormHandler(this.navigation);

        // Check for saved progress
        this.checkSavedProgress();

        // Initialize animations
        this.initializeAnimations();

        console.log('99Interview.com app initialized successfully!');
    }

    checkSavedProgress() {
        const progress = Storage.loadProgress();
        if (progress && progress.userName) {
            // Ask user if they want to continue where they left off
            const continueProgress = confirm(
                `Welcome back, ${progress.userName}! Would you like to continue where you left off?`
            );

            if (continueProgress) {
                // Restore progress
                Storage.save('userName', progress.userName);
                this.navigation.questionRenderer.setCurrentStep(progress.currentStep);
                this.navigation.questionRenderer.setResponses(progress.responses);
                this.navigation.showScreen('questions-screen');
            } else {
                // Clear old progress
                Storage.clearProgress();
            }
        }
    }

    initializeAnimations() {
        // Add entrance animations to initial elements
        const landingCard = document.querySelector('.landing-card');
        if (landingCard) {
            Animations.fadeIn(landingCard);
        }
    }
}

// Initialize the app
new App();