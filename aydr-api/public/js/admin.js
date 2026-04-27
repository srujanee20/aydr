$(function() {
    const path = window.location.pathname;
    $('.sidebar__link').each(function() {
        if (path.startsWith($(this).attr('href')) && $(this).attr('href') !== '/admin/logout') {
            $(this).addClass('active');
        }
    });
});
