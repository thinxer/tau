/**
 * Tau ui library.
 * Requires jQuery and jQuery Templates.
 */
(function(name) {
    var ui = window[name] = {};

    /**
     * Reference the jQuery template cache.
     */
    ui.template = jQuery.template;

    /**
     * Loads a template from the server.
     * Returns a Promise.
     */
    ui.load = function(tmpl_name) {
        return $.get('/tmpl', {name: tmpl_name}, function(d) {
            jQuery.template(tmpl_name, d);
        }, 'text');
    };

    /**
     * Render the specific template with data.
     * You have to ensure the template has already been loaded.
     *
     * Returns a jQuery object.
     */
    ui.tmpl = function(name, data) {
        return jQuery.tmpl(name, data);
    };

    // DeferredTemplate is a template with deferred property.
    var DeferredTemplate = function(d) {
        // Add promise methods to this object.
        d.promise(this);
    };

    // Set up template methods, 'fillTo' an exception
    var tmplMethods = 'prependTo appendTo insertAfter insertBefore'.split(' ');
    var i = tmplMethods.length;
    DeferredTemplate.prototype.fillTo = function(target) {
        this.done(function(t) {
            jQuery(target).html(t);
        });
    };
    while (i--) {
        var method = tmplMethods[i];
        DeferredTemplate.prototype[method] = function(target) {
            this.done(function(t) {
                t[method](target);
            });
        };
    }

    /**
     * Render the specific template with data.
     * It will auto load the template if not loaded.
     *
     * Returns a Promise-like object with the following addtional methods:
     *     prependTo, appendTo, insertAfter, insertBefore, fillTo.
     *
     * Note that these methods (prependTo etc.) are chainable but not meant to
     * be called multiple times.
     *
     * Usage:
     *      U.render('main').appendTo('#wrapper');
     */
    ui.render = function(name, data, fn) {
        if (typeof fn === 'undefined') {
            fn = data;
            data = null;
        }

        var d = jQuery.Deferred();

        if (ui.template[name]) {
            d.resolve(ui.tmpl(name, data));
        } else {
            ui.load(name).success(function() {
                d.resolve(ui.tmpl(name, data));
            }).error(function() {
                d.reject(arguments);
            });
        }

        return new DeferredTemplate(d);
    };

})('U');
