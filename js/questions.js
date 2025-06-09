// js/questions.js
const QUESTIONS = [
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

class QuestionRenderer {
    constructor() {
        this.currentQuestion = 0;
        this.responses = {};
    }

    renderQuestion(questionIndex) {
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
        return QUESTIONS.length;
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