// js/navigation.js
class Navigation {
    constructor() {
        this.currentScreen = 'landing-screen';
        this.questionRenderer = new QuestionRenderer();
        this.bindEvents();
    }

    bindEvents() {
        // Landing screen
        document.getElementById('get-started-btn').addEventListener('click', () => {
            this.showScreen('user-info-screen');
        });

        // User info screen
        document.getElementById('back-to-landing').addEventListener('click', () => {
            this.showScreen('landing-screen');
        });

        // Questions navigation
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('prev-question').addEventListener('click', () => {
            this.prevQuestion();
        });

        // Thank you screen
        document.getElementById('edit-responses').addEventListener('click', () => {
            this.editResponses();
        });

        document.getElementById('back-to-home').addEventListener('click', () => {
            this.resetApp();
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;

        // Handle screen-specific logic
        if (screenId === 'questions-screen') {
            this.initQuestionsScreen();
        } else if (screenId === 'thank-you-screen') {
            this.initThankYouScreen();
        }
    }

    async initQuestionsScreen() {
        try {
            // Show loading state while initializing questions
            this.showQuestionsScreenLoading();
            
            // Ensure questions are loaded
            await this.questionRenderer.ensureQuestionsLoaded();
            
            // Load progress if exists
            if (this.questionRenderer.loadProgress()) {
                // Restore progress
                this.updateProgress();
                this.updateNavigationButtons();
            }

            // Hide loading state
            this.hideQuestionsScreenLoading();
            
            // Render current question
            await this.questionRenderer.renderQuestion(this.questionRenderer.getCurrentStep());
            this.updateProgress();
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Failed to initialize questions screen:', error);
            this.hideQuestionsScreenLoading();
            this.showQuestionsError();
        }
    }
    
    showQuestionsScreenLoading() {
        const container = document.getElementById('question-container');
        container.innerHTML = `
            <div class="question active" style="text-align: center;">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading questions...</p>
                </div>
            </div>
        `;
    }
    
    hideQuestionsScreenLoading() {
        // Loading will be cleared when renderQuestion is called
    }
    
    showQuestionsError() {
        const container = document.getElementById('question-container');
        container.innerHTML = `
            <div class="question active" style="text-align: center;">
                <div class="question-title" style="color: var(--error-color);">
                    <i class="fas fa-exclamation-triangle"></i>
                    Failed to Load Questions
                </div>
                <p style="color: var(--text-secondary); margin: 1rem 0;">
                    There was an error loading the questions. Please try again.
                </p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i>
                    <span>Retry</span>
                </button>
            </div>
        `;
    }

    initThankYouScreen() {
        const userName = Storage.load('userName') || 'there';
        const thankYouMessage = document.getElementById('thank-you-message');
        thankYouMessage.textContent = `Thank you ${userName}, we'll contact you soon!`;
    }

    async nextQuestion() {
        const currentStep = this.questionRenderer.getCurrentStep();
        const totalSteps = this.questionRenderer.getTotalSteps();

        if (currentStep < totalSteps - 1) {
            this.questionRenderer.setCurrentStep(currentStep + 1);
            await this.questionRenderer.renderQuestion(this.questionRenderer.getCurrentStep());
            this.updateProgress();
            this.updateNavigationButtons();
            this.questionRenderer.autoSave();
        } else {
            // Last question - submit form
            this.submitForm();
        }
    }

    async prevQuestion() {
        const currentStep = this.questionRenderer.getCurrentStep();

        if (currentStep > 0) {
            this.questionRenderer.setCurrentStep(currentStep - 1);
            await this.questionRenderer.renderQuestion(this.questionRenderer.getCurrentStep());
            this.updateProgress();
            this.updateNavigationButtons();
        }
    }

    updateProgress() {
        const currentStep = this.questionRenderer.getCurrentStep();
        const totalSteps = this.questionRenderer.getTotalSteps();
        const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

        // Update progress bar
        document.getElementById('progress-fill').style.width = `${progressPercentage}%`;

        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < currentStep) {
                step.classList.add('completed');
            } else if (index === currentStep) {
                step.classList.add('active');
            }
        });

        // Update progress text
        document.getElementById('current-step').textContent = currentStep + 1;
        document.getElementById('total-steps').textContent = totalSteps;
    }

    updateNavigationButtons() {
        const currentStep = this.questionRenderer.getCurrentStep();
        const totalSteps = this.questionRenderer.getTotalSteps();
        const responses = this.questionRenderer.getResponses();
        
        // Ensure QUESTIONS is loaded before accessing it
        if (!QUESTIONS || QUESTIONS.length === 0) {
            console.warn('Questions not loaded yet');
            return;
        }
        
        const currentQuestionId = QUESTIONS[currentStep]?.id;

        // Update prev button
        document.getElementById('prev-question').disabled = currentStep === 0;

        // Update next button
        const nextBtn = document.getElementById('next-question');
        const hasResponse = currentQuestionId && responses[currentQuestionId] !== undefined;
        nextBtn.disabled = !hasResponse;

        // Update next button text for last question
        if (currentStep === totalSteps - 1) {
            nextBtn.innerHTML = '<span>Submit</span><i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<span>Next</span><i class="fas fa-arrow-right"></i>';
        }
    }

    async submitForm() {
        this.showScreen('loading-screen');

        const userName = Storage.load('userName');
        const responses = this.questionRenderer.getResponses();

        // Prepare submission data
        const submissionData = {
            user_name: userName,
            responses: Object.values(responses),
            submitted_at: new Date().toISOString(),
            questions_source: QUESTIONS === MOCK_QUESTIONS ? 'mock' : 'api'
        };

        try {
            // Simulate API call (replace with actual endpoint)
            await this.simulateApiCall(submissionData);

            // Clear progress after successful submission
            Storage.clearProgress();

            // Show thank you screen
            setTimeout(() => {
                this.showScreen('thank-you-screen');
            }, 1500);

        } catch (error) {
            console.error('Submission failed:', error);
            // Handle error - could show error screen or message
            alert('Submission failed. Please try again.');
            this.showScreen('questions-screen');
        }
    }

    async simulateApiCall(data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Log the data that would be sent
        console.log('Submission data:', JSON.stringify(data, null, 2));

        // In a real implementation, replace this with:
        // const response = await fetch(CONFIG.SUBMIT_URL, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(data)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }
        // 
        // return await response.json();

        return { success: true, message: 'Data received successfully' };
    }

    editResponses() {
        this.showScreen('questions-screen');
    }

    resetApp() {
        // Clear all data
        Storage.clearProgress();
        Storage.clear('userName');

        // Reset question renderer
        this.questionRenderer = new QuestionRenderer();

        // Reset questions loading state
        QUESTIONS = [];

        // Clear form
        document.getElementById('user-info-form').reset();

        // Go back to landing
        this.showScreen('landing-screen');
    }
}