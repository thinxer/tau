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
     * If force_reload is true, it will ignore the template cache.
     * Returns a Promise which will resolve with the compiled template.
     */
    ui.load = function(tmpl_name, force_reload) {
        var param = {};
        param.name = tmpl_name;
        if (window.VERSION) param.v = VERSION;

        var deferred = jQuery.Deferred();
        if (ui.template[tmpl_name] && !force_reload) {
            deferred.resolve(ui.template[tmpl_name]);
        } else {
            $.get('/tmpl', param, function(d) {
                deferred.resolve($.template(tmpl_name, d));
            }, 'text').error(deferred.reject);
        }
        return deferred.promise();
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
            ui.load(name).done(function() {
                d.resolve(ui.tmpl(name, data, option));
            }).fail(d.reject);
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

/**
 * dialog
 */
(function(name, $) {
    var ui = window[name] = window[name] || {};

    ui.center = function(e) {
        $(e).offset({
            left: ($(window).width() - $(e).width()) / 2,
            top: ($(window).height() - $(e).height()) / 2
        });
    };

    var remove_dialog = function(){
        $('.dialog-wrapper').remove();
    };

    /**
     * show custom dialog 
     * 
     * @param {boolean} modal, whether the dialog is modal
     * @param {string} title, the title of the dialog
     * 
     * note that the dialog will have display property none, you must
     * set display block when the dialog is ready to show
     * (e.g. adjust position, add content ...)
     */
    ui.dialog = function(modal, title) {
        return ui.render('dialog',{
            title: title
        }).appendTo('body').done(function(r){
            if (modal) {
                r.addClass('fog');
            }
            $('.dialog .dialog-close').click(function(e){
                remove_dialog();
            });
        });
    }


    /**
     * show confirm dialog
     * 
     * @param {function} on_yes, yes handler
     * @param {function} on_no, no handler
     * @param {string} title, title of the dialog
     *
     * if 1 arguments given, it should be on_yes or title
     * if 2 arguments given, the first must be on_yes, the second can be on_no or title
     * if 3 given, they must be on_yes on_no and title
     */
    ui.confirm_dialog = function(on_yes, on_no, title) {
        if (arguments.length == 1) {
            if ($.isFunction(arguments[0])) {
                on_yes = arguments[0];
            } else if ($.type(arguments[0] === 'string')) {
                title = arguments[0];
            }
        } else if (arguments.length == 2) {
            if ($.isFunction(arguments[1])) {
                on_no = arguments[1];
            } else if ($.type(arguments[1]) === 'string') {
                title = arguments[1];
            }
        } else if(arguments.length > 2){
            on_no = arguments[1];
            title = arguments[2];
        }
        if (!title) {
            title = _('Are you sure ?');
        }
        ui.dialog(false, title).done(function(){
            ui.render('confirm_dialog').fillTo('.dialog-wrapper .dialog-content').done(function(){
                $('.dialog-content .yes').click(function(){
                    remove_dialog();
                    if (on_yes) on_yes();
                });
                $('.dialog-content .no').click(function(){
                    remove_dialog();
                    if (on_no) on_no();
                });
                ui.center('body .dialog');
                $('body .dialog').css('display', 'block');
            });
        });
    }

})('U', jQuery);

// vim: set et ts=4 sw=4 tw=0 :
