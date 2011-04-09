/*
 * Depends on jQuery, tau, ui.
 */

(function(name) {
    var c = window[name] = {};

    setHash = function() {
        var args = [].slice.call(arguments, 0);
        location.hash = '#' + args.join('/');
    };

    getHash = function() {
        if (location.hash)
            return location.hash.substring(1).split('/');
        else
            return [];
    };

    c.handlers = {};

    /**
     * c.path(): get current path,
     * c.path('home'): set path to 'home',
     * c.path('home', fn): set 'home' handler to fn.
     *
     */
    c.path = function(path, fn) {
        if (arguments.length == 0) {
            return getHash();
        } else if (arguments.length == 1) {
            setHash(path);
        } else if (arguments.length == 2) {
            c.handlers[path] = fn;
        }
    };

    // Wait for DOM to become ready.
    jQuery(function() {

        /**
         * Bind hashchange event.
         * special paths:
         *      default: when hash is empty
         *      notfound: when no handler has been found
         */
        jQuery(window).bind('hashchange', function(e) {
            var path = c.path();
            if (path.length == 0) {
                // Should cause js error is no default handler.
                c.handlers.default();
            } else {
                // Fall back to notfound if no handler found.
                var handler = c.handlers[path[0]] || c.handlers.notfound;
                // Should cause js error if none found.
                handler(path.slice(1));
            }
        }).trigger('hashchange');
    });

})('C');
