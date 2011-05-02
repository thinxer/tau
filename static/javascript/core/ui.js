/**
 * Tau ui library.
 * Requires jQuery and jQuery Templates.
 */

/**
 * The template helper.
 * Requires jQuery Templates.
 */
(function(name, $) {
    var ui = window[name] = window[name] || {};

    /**
     * Reference the jQuery template cache.
     */
    ui.template = $.template;

    /**
     * Loads a template from the server.
     * Returns a Promise.
     */
    ui.load = function(tmpl_name) {
        var param = {};
        param.name = tmpl_name;
        if (window.VERSION) param.v = VERSION;

        return $.get('/tmpl', param, function(d) {
            $.template(tmpl_name, d);
        }, 'text');
    };

    /**
     * Render the specific template with data.
     * You have to ensure the template has already been loaded.
     *
     * Returns a jQuery object.
     */
    ui.tmpl = function(name, data, option) {
        return $.tmpl(name, data, option);
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
            $(target).html(t);
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
        var d = $.Deferred();

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

})('U', jQuery);

/**
 * Flash messages.
 */
(function(name, $) {
    var types = ['info', 'error', 'success'];
    var default_duration = {
        info: 5000,
        error: 10000,
        success: 3000
    };
    var ui = window[name] = window[name] || {};

    var flash;

    // last timeout id.
    var timeout;
    /**
     * Display a bar containing the message in the given type.
     * If msg is undefined or null, it will hide the bar.
     * If duration is set to 0, it will not auto-hide.
     */
    ui.flash = function(msg, type, duration) {
        // Setup flash div.
        if (!flash) {
            flash = $('#flash');
            flash.find('.close').click(function() {
                flash.slideUp();
            });
        }

        // Setup message or hide and return.
        if (msg) {
            flash.find('p').text(msg);
        } else {
            flash.slideUp();
            return;
        }
        // Set proper class.
        flash.removeClass(types.join(' ')).addClass(type);
        // Display it.
        flash.slideDown('fast');

        // Set auto hide.
        if (timeout) {
            clearTimeout(timeout);
        }
        if (typeof(duration) === 'undefined') {
            duration = default_duration[type] || 0;
        }
        if (duration) {
            timeout = setTimeout(function() {
                flash.slideUp();
            }, duration);
        };
    };

    // specific information
    $(types).each(function(i, type) {
        ui[type] = function(msg, duration) {
            ui.flash(msg, type, duration);
        };
    });
})('U', jQuery);

// vim: set et ts=4 sw=4 tw=0 :
