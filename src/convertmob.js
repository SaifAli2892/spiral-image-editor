// Mobile Navigation Controller for Convert Page - Enhanced Android Compatibility
(function() {
    'use strict';
    
    console.log('Mobile navigation script loading...');
    
    // Wait for DOM to be fully loaded
    function initializeMobileNavigation() {
        const mobileIcon = document.getElementById('convert-mobile-icon');
        const navLinks = document.getElementById('convert-nav-links');
        
        if (!mobileIcon || !navLinks) {
            console.error('Convert Page - Mobile navigation elements not found!');
            console.error('Mobile Icon found:', !!mobileIcon);
            console.error('Nav Links found:', !!navLinks);
            return false;
        }
        
        console.log('Convert Page - Mobile navigation elements found successfully!');

        // Remove any existing event listeners to prevent duplicates
        const newMobileIcon = mobileIcon.cloneNode(true);
        mobileIcon.parentNode.replaceChild(newMobileIcon, mobileIcon);
        
        // Get the new element reference
        const cleanMobileIcon = document.getElementById('convert-mobile-icon');
        
        // State management
        let isMenuOpen = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        // Mobile menu toggle function
        function toggleMobileMenu(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            console.log('Convert Page - toggleMobileMenu called, current state:', isMenuOpen);
            
            isMenuOpen = !isMenuOpen;
            
            // Toggle classes
            cleanMobileIcon.classList.toggle('active', isMenuOpen);
            navLinks.classList.toggle('active', isMenuOpen);
            
            // Handle body scroll
            if (isMenuOpen) {
                document.body.classList.add('mobile-menu-open');
                document.body.style.overflow = 'hidden';
                console.log('Convert Page - Menu opened');
            } else {
                document.body.classList.remove('mobile-menu-open');
                document.body.style.overflow = '';
                closeAllDropdowns();
                console.log('Convert Page - Menu closed');
            }
        }

        function closeMobileMenu() {
            if (!isMenuOpen) return;
            
            isMenuOpen = false;
            cleanMobileIcon.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
            closeAllDropdowns();
            
            console.log('Convert Page - Menu forcibly closed');
        }

        function closeAllDropdowns() {
            document.querySelectorAll('.dropdown-parent').forEach(parent => {
                parent.classList.remove('active');
            });
        }

        // Enhanced event handling for Android devices
        cleanMobileIcon.addEventListener('click', toggleMobileMenu, { passive: false });
        cleanMobileIcon.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: false });

        cleanMobileIcon.addEventListener('touchend', function(e) {
            e.preventDefault();
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            // Check if it's a tap (minimal movement)
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);
            
            if (deltaX < 10 && deltaY < 10) {
                toggleMobileMenu(e);
            }
        }, { passive: false });

        // Handle navigation links
        const mobileNavLinks = navLinks.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            // Clone to remove existing listeners
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', function(e) {
                const parentLi = this.parentElement;
                const dropdown = parentLi.querySelector('.dropdown-content');
                
                if (dropdown && window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other dropdowns
                    document.querySelectorAll('.dropdown-parent').forEach(parent => {
                        if (parent !== parentLi) {
                            parent.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    parentLi.classList.toggle('active');
                    console.log('Dropdown toggled for:', this.textContent);
                } else if (!this.getAttribute('href').startsWith('#')) {
                    // Close menu for regular links
                    setTimeout(closeMobileMenu, 100);
                }
            }, { passive: false });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !navLinks.contains(e.target) && !cleanMobileIcon.contains(e.target)) {
                closeMobileMenu();
            }
        }, { passive: true });

        // Close menu on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && isMenuOpen) {
                closeMobileMenu();
            }
        }, { passive: true });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMobileMenu();
            }
        }, { passive: true });

        // Add dropdown parent class
        const dropdownParents = navLinks.querySelectorAll('li');
        dropdownParents.forEach(parent => {
            const dropdown = parent.querySelector('.dropdown-content');
            if (dropdown) {
                parent.classList.add('dropdown-parent');
            }
        });

        // Enhanced touch gestures for better mobile experience
        let startY = 0;
        
        navLinks.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });

        navLinks.addEventListener('touchmove', function(e) {
            if (!isMenuOpen) return;
            
            const currentY = e.touches[0].clientY;
            const diff = startY - currentY;
            
            // Close menu on upward swipe
            if (diff > 100) {
                closeMobileMenu();
            }
        }, { passive: true });

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

        console.log('Convert page mobile navbar controller loaded successfully');
        return true;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMobileNavigation);
    } else {
        initializeMobileNavigation();
    }

    // Fallback initialization after a short delay
    setTimeout(function() {
        if (!document.getElementById('convert-mobile-icon')?.classList.contains('initialized')) {
            console.log('Fallback initialization triggered');
            if (initializeMobileNavigation()) {
                document.getElementById('convert-mobile-icon')?.classList.add('initialized');
            }
        }
    }, 1000);

})();
