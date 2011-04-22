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
    ui.tmpl = function(name, data, option) {
        return jQuery.tmpl(name, data, option);
    };

    // DeferredTemplate is a template with deferred property.
    var DeferredTemplate = function(d) {
        // Add promise methods to this object.
        d.promise(this);
    };

    // Set up template methods.

    /**
     * Replace target's content with rendered template.
     */
    DeferredTemplate.prototype.fillTo = function(target) {
        return this.done(function(t) {
            jQuery(target).html(t);
        });
    };

    /**
     * Function fn will be called with rendered template.
     */
    DeferredTemplate.prototype.tmpl = function(fn) {
        return this.done(function(t) {
            fn(t);
        });
    };

    /**
     * Other methods corresponding to jQuery template.
     */
    var tmplMethods = 'prependTo appendTo insertAfter insertBefore'.split(' ');
    var i = tmplMethods.length;
    while (i--) {
        var method = tmplMethods[i];
        // Need to make closure to enclose the 'method'.
        DeferredTemplate.prototype[method] = (function(method) {
            return function(target) {
                return this.done(function(t) {
                    t[method](target);
                });
            };
        })(method);
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
    ui.render = function(name, data, option) {
        var d = jQuery.Deferred();

        if (ui.template[name]) {
            d.resolve(ui.tmpl(name, data, option));
        } else {
            ui.load(name).success(function() {
                d.resolve(ui.tmpl(name, data, option));
            }).error(function() {
                d.reject(arguments);
            });
        }

        return new DeferredTemplate(d);
    };

})('U');

// vim: set et ts=4 sw=4 tw=0 :
