// Simple feedback form functionality with FormSubmit
document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');
    const submitBtn = feedbackForm.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    feedbackForm.addEventListener('submit', function(e) {
        // Show loading state before form submission
        setLoadingState(true);
        
        // Let the form submit naturally to FormSubmit
        // FormSubmit will handle the email sending
        
        // Optional: Add a small delay to show loading state
        setTimeout(() => {
            // The form will submit and redirect automatically
        }, 500);
    });

    function setLoadingState(loading) {
        if (loading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }
});

// Smooth scroll for footer links
document.addEventListener('DOMContentLoaded', function() {
    const feedbackLink = document.querySelector('a[href="#feedback-section"]');
    if (feedbackLink) {
        feedbackLink.addEventListener('click', function(e) {
            e.preventDefault();
            const feedbackSection = document.querySelector('.feedback-section');
            if (feedbackSection) {
                feedbackSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});