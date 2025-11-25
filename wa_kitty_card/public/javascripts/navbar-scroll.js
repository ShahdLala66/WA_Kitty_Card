(function() {
    let lastScrollTop = 0;
    const $navbar = $('.navbar');
    const scrollThreshold = 5;
    const navbarHeight = $navbar.height() || 0;

    if (!$navbar.length) return;

    $(window).on('scroll', function() {
        const currentScroll = $(window).scrollTop();
        
        if (currentScroll < 0) return;
        if (Math.abs(lastScrollTop - currentScroll) <= scrollThreshold) return;
        
        if (currentScroll > lastScrollTop && currentScroll > navbarHeight) {
            $navbar.addClass('navbar-hidden');
        } else if (currentScroll < lastScrollTop) {
            $navbar.removeClass('navbar-hidden');
        }
        
        lastScrollTop = currentScroll;
    });
})();
