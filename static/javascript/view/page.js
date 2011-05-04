/**
 *  For page.html,
 *  requires ui.js.
 */

(function(name){
    var u = U[name] = {};

    u.header = {
        show: function() {
            jQuery('#header').animate({opacity: 1})
                .find('a').removeAttr('tabindex');
        },
        hide: function() {
            jQuery('#header').animate({opacity: 0})
                .find('a').attr('tabindex', -1);
        }
    };

    // Prevent hash anchors from scrolling the page.
    jQuery('a[href^=\\#]').click(function(e) {
        e.preventDefault();
        // Set path through our router.
        R.path(jQuery(this).attr('href').substring(1));
        // Quirk to blur this.
        $(this).blur();
    });

    // Automatically update timestamps on page.
    setInterval(function() {
        $('.timestamp').each(function() {
            var e = jQuery(this);
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
})("PAGE");

