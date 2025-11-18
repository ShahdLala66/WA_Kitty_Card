(function() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 5;
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    
    if (!navbar) return;

    navbar.style.transition = 'transform 0.3s ease-in-out';

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll < 0) return;
        if (Math.abs(lastScrollTop - currentScroll) <= scrollThreshold) return;
        if (currentScroll > lastScrollTop && currentScroll > navbarHeight) {
            navbar.style.transform = 'translateY(-100%)';
        } 
        else if (currentScroll < lastScrollTop) {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScroll;
    }, { passive: true });
})();
