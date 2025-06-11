// js/questions.js
// Mock questions as fallback
const MOCK_QUESTIONS = [
    {
        id: 'role',
        title: 'Which role are you applying for?',
        type: 'single-choice',
        options: [
            { value: 'frontend-developer', text: 'Frontend Developer', icon: 'fas fa-code' },
            { value: 'backend-developer', text: 'Backend Developer', icon: 'fas fa-server' },
            { value: 'fullstack-developer', text: 'Fullstack Developer', icon: 'fas fa-layer-group' },
            { value: 'ui-ux-designer', text: 'UI/UX Designer', icon: 'fas fa-paint-brush' },
            { value: 'product-manager', text: 'Product Manager', icon: 'fas fa-briefcase' }
        ]
    },
    {
        id: 'experience',
        title: 'What\'s your years of experience?',
        type: 'single-choice',
        options: [
            { value: '0-1', text: '0-1 years (Entry Level)', icon: 'fas fa-seedling' },
            { value: '2-3', text: '2-3 years (Junior)', icon: 'fas fa-user-graduate' },
            { value: '4-6', text: '4-6 years (Mid-level)', icon: 'fas fa-user-tie' },
            { value: '7-10', text: '7-10 years (Senior)', icon: 'fas fa-medal' },
            { value: '10+', text: '10+ years (Expert)', icon: 'fas fa-crown' }
        ]
    },
    {
        id: 'availability',
        title: 'What time slot can you be available for interviews?',
        type: 'single-choice',
        options: [
            { value: 'weekdays-morning', text: 'Weekdays 9-12 PM', icon: 'fas fa-sun' },
            { value: 'weekdays-afternoon', text: 'Weekdays 1-5 PM', icon: 'fas fa-clock' },
            { value: 'weekdays-evening', text: 'Weekdays 6-9 PM', icon: 'fas fa-moon' },
            { value: 'flexible', text: 'Flexible (Any time)', icon: 'fas fa-globe' }
        ]
    },
    {
        id: 'location',
        title: 'What\'s your preferred job location?',
        type: 'single-choice',
        options: [
            { value: 'remote', text: 'Remote', icon: 'fas fa-home' },
            { value: 'hybrid', text: 'Hybrid', icon: 'fas fa-laptop-house' },
            { value: 'on-site-bangalore', text: 'On-site - Bangalore', icon: 'fas fa-building' },
            { value: 'on-site-pune', text: 'On-site - Pune', icon: 'fas fa-building' },
            { value: 'on-site-other', text: 'On-site - Other', icon: 'fas fa-map-marker-alt' }
        ]
    },
    {
        id: 'contact',
        title: 'What\'s your contact information?',
        type: 'input',
        inputType: 'email',
        placeholder: 'your.email@example.com',
        icon: 'fas fa-envelope',
        validation: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        }
    }
];

// Global questions variable
let QUESTIONS = [];

// Questions API Service
class QuestionsService {
    static async fetchQuestions() {
        let attempts = 0;
        
        while (attempts < CONFIG.RETRY_ATTEMPTS) {
            try {
                console.log(`Attempting to fetch questions from API (attempt ${attempts + 1}/${CONFIG.RETRY_ATTEMPTS})`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
                
                const response = await fetch(CONFIG.QUESTIONS_API_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`API response not ok: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Validate the response structure
                if (!Array.isArray(data) && !Array.isArray(data.questions)) {
                    throw new Error('Invalid API response format');
                }
                
                const questions = Array.isArray(data) ? data : data.questions;
                
                // Validate each question has required fields
                const isValidQuestions = questions.every(q => 
                    q.id && q.title && q.type && 
                    (q.type === 'input' || (q.type === 'single-choice' && Array.isArray(q.options)))
                );
                
                if (!isValidQuestions) {
                    throw new Error('Invalid question structure in API response');
                }
                
                console.log('Successfully fetched questions from API');
                return questions;
                
            } catch (error) {
                attempts++;
                console.warn(`Failed to fetch questions (attempt ${attempts}):`, error.message);
                
                if (attempts >= CONFIG.RETRY_ATTEMPTS) {
                    console.warn('All API attempts failed, falling back to mock questions');
                    return null;
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }
        
        return null;
    }
    
    static async initializeQuestions() {
        try {
            // Show loading indicator
            this.showQuestionsLoading();
            
            // Try to fetch from API
            const apiQuestions = await this.fetchQuestions();
            
            if (apiQuestions) {
                QUESTIONS = apiQuestions;
                this.showQuestionsLoadSuccess('API');
            } else {
                // Fallback to mock questions
                QUESTIONS = MOCK_QUESTIONS;
                this.showQuestionsLoadSuccess('Mock');
            }
            
            // Hide loading indicator
            this.hideQuestionsLoading();
            
            return QUESTIONS;
            
        } catch (error) {
            console.error('Failed to initialize questions:', error);
            QUESTIONS = MOCK_QUESTIONS;
            this.showQuestionsLoadSuccess('Mock');
            this.hideQuestionsLoading();
            return QUESTIONS;
        }
    }
    
    static showQuestionsLoading() {
        // Create and show loading toast
        const toast = document.createElement('div');
        toast.id = 'questions-loading-toast';
        toast.className = 'toast show';
        toast.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading questions...</span>
        `;
        document.body.appendChild(toast);
    }
    
    static hideQuestionsLoading() {
        const toast = document.getElementById('questions-loading-toast');
        if (toast) {
            toast.remove();
        }
    }
    
    static showQuestionsLoadSuccess(source) {
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Questions loaded from ${source}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

class QuestionRenderer {
    constructor() {
        this.currentQuestion = 0;
        this.responses = {};
        this.questionsLoaded = false;
    }
    
    async ensureQuestionsLoaded() {
        if (!this.questionsLoaded) {
            await QuestionsService.initializeQuestions();
            this.questionsLoaded = true;
        }
    }

    async renderQuestion(questionIndex) {
        // Ensure questions are loaded before rendering
        await this.ensureQuestionsLoaded();
        
        if (!QUESTIONS || QUESTIONS.length === 0) {
            this.showError('No questions available');
            return;
        }
        
        if (questionIndex >= QUESTIONS.length) {
            console.error('Question index out of bounds');
            return;
        }
        
        const question = QUESTIONS[questionIndex];
        const container = document.getElementById('question-container');

        container.innerHTML = '';

        const questionDiv = document.createElement('div');
        questionDiv.className = 'question active';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'question-title';
        titleDiv.textContent = question.title;
        questionDiv.appendChild(titleDiv);

        if (question.type === 'single-choice') {
            this.renderMultipleChoice(questionDiv, question);
        } else if (question.type === 'input') {
            this.renderInput(questionDiv, question);
        }

        container.appendChild(questionDiv);

        // Restore previous answer if exists
        this.restoreAnswer(question);
    }
    
    showError(message) {
        const container = document.getElementById('question-container');
        container.innerHTML = `
            <div class="question active">
                <div class="question-title" style="color: var(--error-color);">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error: ${message}
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        <span>Retry</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderMultipleChoice(container, question) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'question-options';

        question.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.dataset.value = option.value;

            optionDiv.innerHTML = `
                    <i class="${option.icon} option-icon"></i>
                    <span>${option.text}</span>
                `;

            optionDiv.addEventListener('click', () => {
                // Remove previous selection
                optionsDiv.querySelectorAll('.option').forEach(opt =>
                    opt.classList.remove('selected'));

                // Add selection to clicked option
                optionDiv.classList.add('selected');

                // Store response
                this.responses[question.id] = {
                    question: question.title,
                    answer: option.text,
                    value: option.value
                };

                // Enable next button
                document.getElementById('next-question').disabled = false;

                // Auto-save progress
                this.autoSave();

                // Show toast
                this.showToast();
            });

            optionsDiv.appendChild(optionDiv);
        });

        container.appendChild(optionsDiv);
    }

    renderInput(container, question) {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'input-group';

        inputDiv.innerHTML = `
                <div class="input-container">
                    <i class="${question.icon} input-icon"></i>
                    <input type="${question.inputType}" 
                           id="question-input" 
                           class="form-input" 
                           placeholder=" " 
                           ${question.validation?.required ? 'required' : ''}>
                    <label for="question-input" class="floating-label">
                        ${question.placeholder} ${question.validation?.required ? '*' : ''}
                    </label>
                </div>
                <div class="input-error" id="input-error"></div>
            `;

        container.appendChild(inputDiv);

        const input = inputDiv.querySelector('#question-input');
        const errorDiv = inputDiv.querySelector('#input-error');

        input.addEventListener('input', () => {
            const value = input.value.trim();
            let isValid = true;

            if (question.validation?.required && !value) {
                isValid = false;
            } else if (question.validation?.pattern && !question.validation.pattern.test(value)) {
                isValid = false;
            }

            if (!isValid && value) {
                errorDiv.textContent = question.validation?.message || 'Invalid input';
                errorDiv.classList.add('show');
                input.style.borderColor = 'var(--error-color)';
            } else {
                errorDiv.classList.remove('show');
                input.style.borderColor = '';
            }

            if (isValid && value) {
                this.responses[question.id] = {
                    question: question.title,
                    answer: value
                };

                document.getElementById('next-question').disabled = false;
                this.autoSave();
                this.showToast();
            } else {
                document.getElementById('next-question').disabled = true;
                if (this.responses[question.id]) {
                    delete this.responses[question.id];
                }
            }
        });
    }

    restoreAnswer(question) {
        const response = this.responses[question.id];
        if (!response) return;

        if (question.type === 'single-choice') {
            const option = document.querySelector(`[data-value="${response.value}"]`);
            if (option) {
                option.classList.add('selected');
                document.getElementById('next-question').disabled = false;
            }
        } else if (question.type === 'input') {
            const input = document.getElementById('question-input');
            if (input) {
                input.value = response.answer;
                document.getElementById('next-question').disabled = false;
            }
        }
    }

    autoSave() {
        const userName = Storage.load('userName') || '';
        Storage.saveProgress(this.currentQuestion, this.responses, userName);
    }

    showToast() {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, CONFIG.TOAST_DURATION);
    }

    loadProgress() {
        const progress = Storage.loadProgress();
        if (progress) {
            this.currentQuestion = progress.currentStep;
            this.responses = progress.responses || {};
            return true;
        }
        return false;
    }

    getCurrentStep() {
        return this.currentQuestion;
    }

    getTotalSteps() {
        return QUESTIONS.length || MOCK_QUESTIONS.length;
    }

    getResponses() {
        return this.responses;
    }

    setCurrentStep(step) {
        this.currentQuestion = step;
    }

    setResponses(responses) {
        this.responses = responses || {};
    }
}