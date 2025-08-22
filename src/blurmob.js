// Mobile Navigation Controller for Blur Page
document.addEventListener('DOMContentLoaded', function() {
    const mobileIcon = document.getElementById('home-mobile-icon');
    const navLinks = document.getElementById('home-nav-links');
    
    if (!mobileIcon || !navLinks) {
        console.warn('Mobile navigation elements not found on blur page');
        return;
    }

    // Toggle mobile menu
    mobileIcon.addEventListener('click', function() {
        toggleMobileMenu();
    });

    function toggleMobileMenu() {
        // Toggle active class on mobile icon for animation
        mobileIcon.classList.toggle('active');
        
        // Toggle active class on nav links to show/hide menu
        navLinks.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navLinks.classList.contains('active')) {
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }
    }

    function closeMobileMenu() {
        mobileIcon.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        
        // Close all dropdowns
        document.querySelectorAll('.dropdown-parent').forEach(parent => {
            parent.classList.remove('active');
        });
    }

    // Close mobile menu when clicking on navigation links
    const mobileNavLinks = navLinks.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if it's a dropdown parent
            const parentLi = this.parentElement;
            const dropdown = parentLi.querySelector('.dropdown-content');
            
            if (dropdown && window.innerWidth <= 768) {
                e.preventDefault();
                parentLi.classList.toggle('active');
            } else if (!this.getAttribute('href').startsWith('#')) {
                // Only close if it's not an anchor link or dropdown
                closeMobileMenu();
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active')) {
            if (!navLinks.contains(e.target) && !mobileIcon.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });

    // Close mobile menu on window resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Handle dropdown clicks for mobile
    const dropdownParents = document.querySelectorAll('.nav-links li');
    dropdownParents.forEach(parent => {
        const dropdown = parent.querySelector('.dropdown-content');
        if (dropdown) {
            parent.classList.add('dropdown-parent');
        }
    });

    // Touch gestures for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 100;
        const diff = touchStartY - touchEndY;
        
        if (navLinks.classList.contains('active')) {
            // Swipe up to close menu
            if (diff > swipeThreshold) {
                closeMobileMenu();
            }
        }
    }

    // Enhanced scroll behavior for navbar
    let lastScrollTop = 0;
    const navbar = document.querySelector('nav');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                navbar.style.backdropFilter = 'blur(15px)';
            } else {
                navbar.style.background = 'rgba(0, 0, 0, 0.3)';
                navbar.style.backdropFilter = 'blur(8px)';
            }
            
            lastScrollTop = scrollTop;
        }, { passive: true });
    }

    console.log('Blur page mobile navbar controller loaded successfully');
});