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

    async initializeApp() {
        try {
            // Show app loading state
            this.showAppLoading();
            
            // Initialize navigation
            this.navigation = new Navigation();

            // Initialize form handler
            this.formHandler = new FormHandler(this.navigation);

            // Pre-load questions in background for better UX
            this.preloadQuestions();

            // Check for saved progress
            this.checkSavedProgress();

            // Initialize animations
            this.initializeAnimations();
            
            // Hide app loading state
            this.hideAppLoading();

            console.log('99Interview.com app initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.hideAppLoading();
            this.showAppError();
        }
    }
    
    showAppLoading() {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'app-loading';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
        `;
        
        loadingOverlay.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 4px solid #e3e3e3; border-top: 4px solid #0a66c2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p style="color: #1e293b; font-size: 1rem;">Initializing 99Interview...</p>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
    }
    
    hideAppLoading() {
        const loadingOverlay = document.getElementById('app-loading');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.remove(), 300);
        }
    }
    
    showAppError() {
        const errorOverlay = document.createElement('div');
        errorOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        errorOverlay.innerHTML = `
            <div style="text-align: center; max-width: 400px; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h2 style="color: #1e293b; margin-bottom: 1rem;">App Initialization Failed</h2>
                <p style="color: #475569; margin-bottom: 2rem;">There was an error starting the application. Please refresh the page to try again.</p>
                <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: #0a66c2; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-refresh"></i> Refresh Page
                </button>
            </div>
        `;
        
        document.body.appendChild(errorOverlay);
    }
    
    async preloadQuestions() {
        try {
            // Pre-load questions in background for better UX
            console.log('Pre-loading questions in background...');
            await QuestionsService.initializeQuestions();
            console.log('Questions pre-loaded successfully');
        } catch (error) {
            console.warn('Failed to pre-load questions:', error);
            // This is non-blocking, questions will be loaded when needed
        }
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