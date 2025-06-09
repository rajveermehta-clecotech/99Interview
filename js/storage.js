// js/storage.js
class Storage {
    static save(key, data) {
        try {
            // Using memory storage instead of localStorage for Claude.ai compatibility
            window.interviewData = window.interviewData || {};
            window.interviewData[key] = data;
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    static load(key) {
        try {
            if (!window.interviewData) return null;
            return window.interviewData[key] || null;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    static clear(key = null) {
        try {
            if (key) {
                if (window.interviewData) {
                    delete window.interviewData[key];
                }
            } else {
                window.interviewData = {};
            }
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }

    static saveProgress(currentStep, responses, userName = '') {
        const progressData = {
            currentStep,
            responses,
            userName,
            timestamp: Date.now()
        };
        return this.save('progress', progressData);
    }

    static loadProgress() {
        return this.load('progress');
    }

    static clearProgress() {
        return this.clear('progress');
    }
}
