/*
 * Depends on jQuery, jQuery history.
 */

(function(name) {

    // Helper method.
    var run = function(obj, fn, args) {
        if (obj[fn]) {
            return obj[fn].apply(obj, args);
        }
        return null;
    };

    var c = window[name] = {};

    c.handlers = {};

    /**
     * c.path(): get current path,
     * c.path('home'): set path to 'home',
     * c.path('home/page1']): set path to 'home/page1',
     * c.path(['home', 'page1']): set path to 'home/page1',
     * c.path('home', handler): set 'home' handler.
     *
     * handler should be an object like:
     *  {
     *      enter: function() {},
     *      change: function(path, oldPath, level) {},
     *      leave: function(oldPath) {}
     *  }
     *
     * handler could also be a Function, which acts like the 'change' handler.
     *
     * note: 'change' handler will also be called after 'enter'.
     *
     */
    c.path = function(path, handler) {
        if (arguments.length == 0) {
            var hashes = location.hash.length>1 ?
                            location.hash.substring(1).split('/') :
                            [];
            var i = hashes.length;
            while (i--) hashes[i] = decodeURIComponent(hashes[i]);
            return hashes;

        } else if (arguments.length == 1) {
            if (jQuery.isArray(path)) {
                // encode each component.
                var args = path.slice(0);
                var i = args.length;
                while (i--) args[i] = encodeURIComponent(args[i]);
                jQuery.history.load(args.join('/'));
            } else {
                // load it directly.
                jQuery.history.load(path.toString());
            }

        } else if (arguments.length == 2) {
            var _handler = handler;
            if (jQuery.isFunction(handler)) {
                _handler = {
                    enter: null,
                    change: handler,
                    leave: null
                };
            }
            c.handlers[path] = _handler;
        }
    };

    c.lastPath = [];
    c.lastHandler = null;

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

        var enter_rs;

        // Change handler when level == 0.
        if (level == 0) {
            if (c.lastHandler) {
                run(c.lastHandler, 'leave', [c.lastPath]);
            }
            enter_rs = run(handler, 'enter', []);
        }

        // Call change handler.
        if (enter_rs !== false) {
            run(handler, 'change', [path, c.lastPath, level]);
        }

        //Save last path and handler.
        c.lastPath = path;
        c.lastHandler = handler;
    }

    /**
     * execute the handler again.
     */
    c.reload = pathchange_handler;

    /**
     * refresh the whole window.
     */
    c.reloadWindow = function() {
        location.reload(true);
    };

    jQuery(function() {
        jQuery.history.init(pathchange_handler, { unescape:true })
    });

})('R');

// vim: set et ts=4 sw=4 tw=0 :
