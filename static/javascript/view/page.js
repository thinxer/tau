/**
 *  For page.html,
 *  requires ui.js.
 */

(function(name, $){
    var u = U[name] = {};

    u.header = {
        show: function() {
            $('#header').animate({opacity: 1})
                .find('a').removeAttr('tabindex');
            if (T.checkLogin()) {
                $('#header').find('a.mypage').attr('href', '#u/' + T.checkLogin());
            } else {
                $('#header').find('a.mypage').attr('href', '#public');
            }
        },
        hide: function() {
            $('#header').animate({opacity: 0})
                .find('a').attr('tabindex', -1);
        }
    };

    // Prevent hash anchors from scrolling the page.
    $('a[href^=\\#]').click(function(e) {
        e.preventDefault();
        // Set path through our router.
        R.path($(this).attr('href').substring(1));
        // Quirk to blur this.
        $(this).blur();
    });

    // Fade footer
    $('#footer').mouseenter(function() {
        $(this).fadeTo('normal', 1);
    }).mouseleave(function() {
        $(this).fadeTo('normal', 0);
    });

    // Automatically update timestamps on page.
    setInterval(function() {
        $('.timestamp').each(function() {
            var e = $(this);
            var timestamp = e.data('timestamp');
            if (timestamp) {
                e.text(_.getReadableDate(timestamp));
            }
        });
    }, 30000);

    R.path('notfound',function() {
        U.render('notfound').fillTo('#main');
    });
    R.path('default', function() {
        if (T.checkLogin()) {
            R.path('home');
        } else {
            R.path('public');
        }
    });
    R.path('logout', function() {
        T.logout().then(function() {
            R.path('');
        });
    });
})("PAGE", jQuery);

