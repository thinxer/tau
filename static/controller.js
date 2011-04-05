/*
 * Depends on jQuery, tau, ui.
 */

// Wait for DOM to become ready.
$(function() {

    var setHash = function() {
        var args = [].splice.call(arguments, 0);
        location.hash = '#' + args.join('/');
    };

    var getHash = function() {
        if (location.hash)
            return location.hash.substring(1).split('/');
        else
            return '';
    }

    var handlers = {
        home: function() {
            U.tmpl2('home', function() {
                $('#main').html(this);
            });
        }
    };

    $(window).bind('hashchange', function(e) {
        var hash = location.hash;
        if (hash.length == 0) {
            setHash('home');
        } else {
            var hashes = getHash();
            handlers[hashes[0]](hashes.slice(1));
        }
    }).trigger('hashchange');
});
