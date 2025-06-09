// js/animations.js
class Animations {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';

        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);

            element.style.opacity = opacity;

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    static slideIn(element, direction = 'right', duration = 300) {
        const translateX = direction === 'right' ? '50px' : '-50px';

        element.style.transform = `translateX(${translateX})`;
        element.style.opacity = '0';
        element.style.display = 'block';

        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const factor = Math.min(progress / duration, 1);

            const currentTranslate = parseFloat(translateX) * (1 - factor);
            element.style.transform = `translateX(${currentTranslate}px)`;
            element.style.opacity = factor;

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    static pulse(element) {
        element.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 1000);
    }

    static bounceIn(element) {
        element.style.animation = 'bounceIn 0.6s ease-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }
}
