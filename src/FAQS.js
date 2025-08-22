/**
 * Spiral Tool Free Image Editor - FAQ Page Interactive Functionality
 * Handles accordion-style FAQ interactions with smooth animations
 */

class FAQManager {
    constructor() {
        this.init();
    }

    /**
     * Initialize the FAQ functionality
     */
    init() {
        this.attachEventListeners();
        this.setupKeyboardNavigation();
        this.addLoadingAnimation();
    }

    /**
     * Attach click event listeners to all FAQ questions
     */
    attachEventListeners() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach((question) => {
            question.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFAQ(question);
            });

            // Add keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFAQ(question);
                }
            });

            // Make questions focusable for keyboard navigation
            question.setAttribute('tabindex', '0');
            question.setAttribute('role', 'button');
            question.setAttribute('aria-expanded', 'false');
        });
    }

    /**
     * Toggle FAQ item open/closed state
     * @param {HTMLElement} questionElement - The clicked FAQ question element
     */
    toggleFAQ(questionElement) {
        const faqId = questionElement.getAttribute('data-faq');
        const answerElement = document.getElementById(faqId);
        const isActive = questionElement.classList.contains('active');

        if (isActive) {
            this.closeFAQ(questionElement, answerElement);
        } else {
            this.openFAQ(questionElement, answerElement);
        }

        // Update ARIA attributes for accessibility
        questionElement.setAttribute('aria-expanded', !isActive);
        
        // Add analytics tracking (if needed in the future)
        this.trackFAQInteraction(faqId, !isActive);
    }

    /**
     * Open a FAQ item with smooth animation
     * @param {HTMLElement} questionElement - The FAQ question element
     * @param {HTMLElement} answerElement - The FAQ answer element
     */
    openFAQ(questionElement, answerElement) {
        // Add active class to question
        questionElement.classList.add('active');
        
        // Show answer with smooth animation
        answerElement.classList.add('active');
        
        // Smooth scroll to question if it's below the fold
        setTimeout(() => {
            this.scrollToElement(questionElement);
        }, 200);
    }

    /**
     * Close a FAQ item with smooth animation
     * @param {HTMLElement} questionElement - The FAQ question element
     * @param {HTMLElement} answerElement - The FAQ answer element
     */
    closeFAQ(questionElement, answerElement) {
        // Remove active class from question
        questionElement.classList.remove('active');
        
        // Hide answer with smooth animation
        answerElement.classList.remove('active');
    }

    /**
     * Smooth scroll to element if it's not fully visible
     * @param {HTMLElement} element - Element to scroll to
     */
    scrollToElement(element) {
        const elementRect = element.getBoundingClientRect();
        const isElementVisible = (
            elementRect.top >= 0 &&
            elementRect.bottom <= window.innerHeight
        );

        if (!isElementVisible) {
            const offsetTop = element.offsetTop - 100; // 100px offset from top
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Setup keyboard navigation for better accessibility
     */
    setupKeyboardNavigation() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach((question, index) => {
            question.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.focusNextQuestion(index, faqQuestions);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.focusPreviousQuestion(index, faqQuestions);
                        break;
                    case 'Home':
                        e.preventDefault();
                        faqQuestions[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        faqQuestions[faqQuestions.length - 1].focus();
                        break;
                }
            });
        });
    }

    /**
     * Focus next FAQ question
     * @param {number} currentIndex - Current question index
     * @param {NodeList} questions - All FAQ questions
     */
    focusNextQuestion(currentIndex, questions) {
        const nextIndex = (currentIndex + 1) % questions.length;
        questions[nextIndex].focus();
    }

    /**
     * Focus previous FAQ question
     * @param {number} currentIndex - Current question index
     * @param {NodeList} questions - All FAQ questions
     */
    focusPreviousQuestion(currentIndex, questions) {
        const prevIndex = currentIndex === 0 ? questions.length - 1 : currentIndex - 1;
        questions[prevIndex].focus();
    }

    /**
     * Add loading animation delay to FAQ items for better user experience
     */
    addLoadingAnimation() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        // Reset any existing animations
        faqItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
        });

        // Animate items in sequence
        faqItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = 'all 0.6s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * Track FAQ interactions for analytics (placeholder for future implementation)
     * @param {string} faqId - FAQ item identifier
     * @param {boolean} isOpened - Whether the FAQ was opened or closed
     */
    trackFAQInteraction(faqId, isOpened) {
        // This is a placeholder for analytics tracking
        // In a production environment, you might send data to Google Analytics, etc.
        if (window.gtag) {
            window.gtag('event', 'faq_interaction', {
                'faq_id': faqId,
                'action': isOpened ? 'open' : 'close',
                'event_category': 'FAQ'
            });
        }
        
        // Console log for debugging (remove in production)
        console.log(`FAQ ${faqId} was ${isOpened ? 'opened' : 'closed'}`);
    }

    /**
     * Close all open FAQs (utility method)
     */
    closeAllFAQs() {
        const activeQuestions = document.querySelectorAll('.faq-question.active');
        const activeAnswers = document.querySelectorAll('.faq-answer.active');
        
        activeQuestions.forEach(question => {
            question.classList.remove('active');
            question.setAttribute('aria-expanded', 'false');
        });
        
        activeAnswers.forEach(answer => {
            answer.classList.remove('active');
        });
    }

    /**
     * Open all FAQs (utility method)
     */
    openAllFAQs() {
        const allQuestions = document.querySelectorAll('.faq-question');
        const allAnswers = document.querySelectorAll('.faq-answer');
        
        allQuestions.forEach(question => {
            question.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        });
        
        allAnswers.forEach(answer => {
            answer.classList.add('active');
        });
    }

    /**
     * Search functionality for FAQs
     * @param {string} searchTerm - Term to search for
     */
    searchFAQs(searchTerm) {
        const faqItems = document.querySelectorAll('.faq-item');
        const normalizedTerm = searchTerm.toLowerCase().trim();
        
        if (!normalizedTerm) {
            // Show all items if search is empty
            faqItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        faqItems.forEach(item => {
            const questionText = item.querySelector('.faq-question h4').textContent.toLowerCase();
            const answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();
            
            if (questionText.includes(normalizedTerm) || answerText.includes(normalizedTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

/**
 * Utility functions for enhanced user experience
 */
const FAQUtils = {
    /**
     * Smooth scroll to top of page
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    /**
     * Check if user prefers reduced motion
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * Get user's preferred color scheme
     */
    getColorScheme() {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    /**
     * Handle responsive design changes
     */
    handleResize() {
        // Adjust layout for mobile devices
        const isMobile = window.innerWidth <= 768;
        const faqContainer = document.querySelector('.faq-container');
        
        if (isMobile && faqContainer) {
            faqContainer.classList.add('mobile-layout');
        } else if (faqContainer) {
            faqContainer.classList.remove('mobile-layout');
        }
    }
};

/**
 * Initialize FAQ functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ manager
    const faqManager = new FAQManager();
    
    // Handle window resize events
    window.addEventListener('resize', FAQUtils.handleResize);
    
    // Initial resize check
    FAQUtils.handleResize();
    
    // Add any additional initialization here
    console.log('Spiral Tool FAQ page loaded successfully');
    
    // Optional: Add performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        });
    }
});

/**
 * Handle page visibility changes (for analytics and optimization)
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('FAQ page hidden');
    } else {
        console.log('FAQ page visible');
    }
});

/**
 * Export classes for potential external use
 * (useful if this script is loaded as a module in the future)
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FAQManager, FAQUtils };
}
