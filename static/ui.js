/*
 * Tau ui library.
 * Requires jQuery and jQuery Templates.
 */
(function(name) {
    var ui = window[name] = {};

    /*
     * Reference the jQuery template cache.
     */
    ui.template = jQuery.template;

    /* 
     * Loads a template from the server.
     * Returns a Promise.
     */
    ui.load = function(tmpl_name) {
        return $.get('/tmpl', {name: tmpl_name}, function(d) {
            jQuery.template(tmpl_name, d);
        }, 'text');
    };

    /*
     * Render the specific template with data.
     * You have to ensure the template has already been loaded.
     *
     * Returns a jQuery object.
     */
    ui.tmpl = function(name, data) {
        return jQuery.tmpl(name, data);
    };

    /* 
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

        return {
            appendTo: function(target) {
                d.done(function(t) {
                    t.appendTo(target);
                });
                return this;
            },
            prependTo: function(target) {
                d.done(function(t) {
                    t.prependTo(target);
                });
                return this;
            },
            insertAfter: function(target) {
                d.done(function(t) {
                    t.insertAfter(target);
                });
                return this;
            },
            insertBefore: function(target) {
                d.done(function(t) {
                    t.insertBefore(target);
                });
                return this;
            },
            fillTo: function(target) {
                d.done(function(t) {
                    jQuery(target).html(t);
                });
                return this;
            },
            done: function(fn) {
                d.done(fn);
                return this;
            },
            then: function(fn) {
                d.then(fn);
                return this;
            },
            fail: function(fn) {
                d.fail(fn);
                return this;
            },
            isResolved: function() {
                return d.isResolved();
            },
            isRejected: function() {
                return d.isRejected();
            }
        };
    };

})('U');
