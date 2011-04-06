/*
 * Depends on jQuery, tau, ui.
 */

(function(name) {
    var c = window[name] = {};

    c.setHash = function() {
        var args = [].splice.call(arguments, 0);
        location.hash = '#' + args.join('/');
    };

    c.getHash = function() {
        if (location.hash)
            return location.hash.substring(1).split('/');
        else
            return '';
    }

    c.handlers = {};

    // TODO allow for more complex path
    c.path = function(path, fn) {
        c.handlers[path] = fn;
    }

    // Wait for DOM to become ready.
    $(function() {

        // Bind hashchange event
        $(window).bind('hashchange', function(e) {
            var hash = location.hash;
            if (hash.length == 0) {
                c.setHash('home');
            } else {
                var hashes = c.getHash();
                c.handlers[hashes[0]](hashes.slice(1));
            }
            }).trigger('hashchange');
    });

})('C');

// Handlers
(function() {

    // Home handler
    C.path('home', function() {
        U.render('home').fillTo('#main');
    });

})();

