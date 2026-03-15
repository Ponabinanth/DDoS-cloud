// SecureChain Mobile Responsiveness - Sidebar Toggle & Touch Gestures

let isMobileMenuOpen = false;
let touchStartY = 0;
let touchStartX = 0;

// Initialize mobile features
function initMobile() {
    // Mobile menu button (add to DOM if needed)
    addMobileMenuButton();
    
    // Touch/swipe for sidebar toggle
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Prevent zoom on double-tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Resize listener for sidebar
    window.addEventListener('resize', handleResize);
    handleResize();
}

// Add mobile hamburger menu button
function addMobileMenuButton() {
    if (document.getElementById('mobile-menu-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'mobile-menu-btn';
    btn.innerHTML = '<i class="fas fa-bars"></i>';
    btn.className = 'mobile-menu-btn';
    btn.onclick = toggleMobileMenu;
    
    document.body.insertBefore(btn, document.body.firstChild);
}

// Toggle mobile sidebar
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    
    if (!sidebar || !main) return;
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (isMobileMenuOpen) {
        sidebar.style.transform = 'translateX(0)';
        main.style.marginLeft = '250px';
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.style.transform = 'translateX(-100%)';
        main.style.marginLeft = '0';
        document.body.style.overflow = '';
    }
}

// Touch handlers for swipe menu
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
}

function handleTouchEnd(event) {
    if (!event.changedTouches[0]) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Swipe threshold
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 100) {
        if (diffX > 0 && isMobileMenuOpen) { // Swipe left, close
            toggleMobileMenu();
        } else if (diffX < 0 && !isMobileMenuOpen) { // Swipe right, open
            toggleMobileMenu();
        }
    }
}

// Handle window resize
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const isMobile = window.innerWidth < 768;
    
    if (!sidebar || !main) return;
    
    if (!isMobile) {
        sidebar.style.transform = '';
        main.style.marginLeft = '250px';
        document.body.style.overflow = '';
        isMobileMenuOpen = false;
    } else {
        sidebar.style.transform = 'translateX(-100%)';
        main.style.marginLeft = '0';
    }
}

// Export for main script
window.initMobile = initMobile;
window.toggleMobileMenu = toggleMobileMenu;

