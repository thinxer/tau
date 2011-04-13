/*
 * Depends on jQuery, jQuery history.
 */

(function(name) {
    var c = window[name] = {};

    c.handlers = {};

    /**
     * c.path(): get current path,
     * c.path('home'): set path to 'home',
     * c.path('home/page1']): set path to 'home/page1',
     * c.path(['home', 'page1']): set path to 'home/page1',
     * c.path('home', fn): set 'home' handler to fn.
     *
     * handler fn should be function(path, level) {},
     * where path is current path and level is current changed path level.
     *
     */
    c.path = function(path, fn) {
        if (arguments.length == 0) {
            var hashes = location.hash.length>1 ?
                            location.hash.substring(1).split('/') :
                            hashes = [];
            var i = hashes.length;
            while (i--) hashes[i] = unescape(hashes[i]);
            return hashes;

        } else if (arguments.length == 1) {
            var args = jQuery.isArray(path) ? path : [path];
            var i = args.length;
            while (i--) args[i] = escape(args[i]);
            jQuery.history.load(args.join('/'));

        } else if (arguments.length == 2) {
            c.handlers[path] = fn;
        }
    };

    c.lastPath = [];

    /**
     * special paths:
     *      default: when hash is empty
     *      notfound: when no handler has been found
     */
    var pathchange_handler = function() {
        var path = c.path();
        var handler = c.handlers[path.length == 0 ? 'default' : path[0]] ||
                        c.handlers['notfound'];

        var level = 0;
        while (level < path.length &&
                level < c.lastPath.length &&
                path[level] == c.lastPath[level])
            level ++;

        handler(path, level);
        c.lastPath = path;
    }

    /**
     * execute the handler again.
     */
    c.reload = pathchange_handler;

    jQuery(function() {
        jQuery.history.init(pathchange_handler, { unescape:'/' })
    });

})('R');

// vim: set et ts=4 sw=4 tw=0 :
