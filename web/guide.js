// User Guide JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton();

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Smooth scrolling for navigation links
    initializeSmoothScrolling();
    
    // Add scroll spy for navigation
    initializeScrollSpy();
    
    // Add intersection observer for animations
    initializeAnimations();
    
    // Keyboard navigation
    initializeKeyboardNavigation();
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (themeIcon && themeText) {
        if (currentTheme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Light';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Dark';
        }
    }
}

function initializeSmoothScrolling() {
    // Enhanced smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without triggering scroll
                history.pushState(null, null, this.getAttribute('href'));
            }
        });
    });
}

function initializeScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const tocItems = document.querySelectorAll('.toc-item');
    
    if (sections.length === 0 || tocItems.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const tocItem = document.querySelector(`.toc-item[href="#${entry.target.id}"]`);
            
            if (entry.isIntersecting) {
                // Remove active class from all items
                tocItems.forEach(item => item.classList.remove('active'));
                // Add active class to current item
                if (tocItem) {
                    tocItem.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
}

function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.guide-section, .action-card, .save-option, .tip-category');
    animateElements.forEach(el => {
        el.classList.add('animate-ready');
        animationObserver.observe(el);
    });
    
    // Add CSS for animations
    if (!document.querySelector('#guide-animations')) {
        const style = document.createElement('style');
        style.id = 'guide-animations';
        style.textContent = `
            .animate-ready {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .toc-item.active {
                border-color: var(--primary-500);
                background: var(--primary-100);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
            }
            
            .demo-node {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .demo-connection {
                animation: connection-flow 3s infinite;
            }
            
            @keyframes connection-flow {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search (if on main page)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Could implement quick navigation menu here
        }
        
        // ESC to scroll to top
        if (e.key === 'Escape') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Arrow keys for section navigation
        if (e.key === 'ArrowDown' && e.ctrlKey) {
            e.preventDefault();
            navigateToNextSection();
        }
        
        if (e.key === 'ArrowUp' && e.ctrlKey) {
            e.preventDefault();
            navigateToPreviousSection();
        }
    });
}

function navigateToNextSection() {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const currentScroll = window.pageYOffset;
    
    for (let i = 0; i < sections.length; i++) {
        const sectionTop = sections[i].offsetTop - 100;
        if (sectionTop > currentScroll) {
            sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        }
    }
}

function navigateToPreviousSection() {
    const sections = Array.from(document.querySelectorAll('section[id]')).reverse();
    const currentScroll = window.pageYOffset;
    
    for (let i = 0; i < sections.length; i++) {
        const sectionTop = sections[i].offsetTop - 100;
        if (sectionTop < currentScroll - 200) {
            sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        }
    }
}

// Add tooltips for interactive elements
function addTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('title');
    tooltip.style.cssText = `
        position: absolute;
        background: var(--background-800);
        color: var(--text-100);
        padding: 0.5rem 0.75rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    // Fade in
    setTimeout(() => tooltip.style.opacity = '1', 10);
    
    // Store reference for cleanup
    e.target._tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        delete e.target._tooltip;
    }
}

// Initialize tooltips when DOM is ready
document.addEventListener('DOMContentLoaded', addTooltips);

// Add copy to clipboard functionality for code examples
function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('.example, .keyboard-shortcut');
    
    codeBlocks.forEach(block => {
        const copyButton = document.createElement('button');
        copyButton.textContent = '📋';
        copyButton.className = 'copy-button';
        copyButton.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--primary-600);
            color: white;
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.8rem;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        block.style.position = 'relative';
        block.appendChild(copyButton);
        
        block.addEventListener('mouseenter', () => copyButton.style.opacity = '1');
        block.addEventListener('mouseleave', () => copyButton.style.opacity = '0');
        
        copyButton.addEventListener('click', () => {
            const text = block.textContent.replace('📋', '').trim();
            navigator.clipboard.writeText(text).then(() => {
                copyButton.textContent = '✅';
                setTimeout(() => copyButton.textContent = '📋', 2000);
            });
        });
    });
}

// Initialize copy buttons when DOM is ready
document.addEventListener('DOMContentLoaded', addCopyButtons);

// Add progress indicator
function addProgressIndicator() {
    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-500), var(--success-500));
        z-index: 1000;
        transition: width 0.1s ease;
    `;
    
    document.body.appendChild(progress);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progress.style.width = Math.min(scrollPercent, 100) + '%';
    });
}

// Initialize progress indicator when DOM is ready
document.addEventListener('DOMContentLoaded', addProgressIndicator);

// Add search functionality for the guide
function addGuideSearch() {
    // This could be implemented to search through guide content
    // For now, we'll add the foundation
    const searchContainer = document.createElement('div');
    searchContainer.className = 'guide-search';
    searchContainer.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    `;
    
    searchContainer.innerHTML = `
        <input type="text" placeholder="Search guide..." style="
            padding: 0.5rem 1rem;
            border: 2px solid var(--primary-400);
            border-radius: 2rem;
            background: var(--background-white);
            color: var(--text-900);
            width: 200px;
        ">
    `;
    
    document.body.appendChild(searchContainer);
    
    // Show search on Ctrl+F
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchContainer.style.opacity = '1';
            searchContainer.style.pointerEvents = 'auto';
            searchContainer.querySelector('input').focus();
        }
        
        if (e.key === 'Escape') {
            searchContainer.style.opacity = '0';
            searchContainer.style.pointerEvents = 'none';
        }
    });
}

// Initialize guide search when DOM is ready
document.addEventListener('DOMContentLoaded', addGuideSearch);
