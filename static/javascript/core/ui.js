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
            flash = $('body>.flash');
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

    /**
     * General dialog.
     *
     * The Dialog itself is a Deferred.
     * When buttons are clicked, resolve with button id and dialog itself.
     * When close is hit, reject with 'close' and dialog itself.
     *
     */
    ui.Dialog = function(options) {
        var defaults = {
            title: 'dialog',
            modal: false,
            content: '',
            bottom: '',
            buttons: ['ok']
        };
        $.extend(this, defaults, options);

        // Set up buttons.
        var i = this.buttons.length;
        while (i--) {
            if (typeof(this.buttons[i]) === 'string') {
                var type = this.buttons[i];
                this.buttons[i] = this.defaultButtons[type];
            }
        }

        // Set up deferred and promise.
        var deferred = $.Deferred();
        deferred.promise(this);

        // Render the dialog.
        var self = this;
        this.tmpl = ui.render('dialog', this).appendTo('body').done(function(d) {
            d.find('.content').html(self.content);
            d.find('.bottom').html(self.bottom);
            // Center it.
            ui.center(d.find('.dialog'));
            // Set up button actions.
            d.find('.button').click(function() {
                deferred.resolve($(this).data('id'), self);
                d.remove();
            });
            d.find('.close').click(function() {
                deferred.reject('close', self);
                d.remove();
            });
        });
    };

    ui.Dialog.prototype.defaultButtons = {
        'ok': {
            id: 'ok',
            type: 'default',
            text: _('button ok')
        },
        'yes': {
            id: 'yes',
            type: 'default',
            text: _('button yes')
        },
        'no': {
            id: 'no',
            type: 'normal',
            text: _('button no')
        },
        'confirm': {
            id: 'confirm',
            type: 'default',
            text: _('button confirm')
        },
        'cancel': {
            id: 'cancel',
            type: 'normal',
            text: _('button cancel')
        },
        'publish': {
            id: 'publish',
            type: 'default',
            text: _('button publish')
        }
    };

    /**
     * shorthand method to create a dialog.
     */
    ui.dialog = function(options) {
        return new ui.Dialog(options);
    }


    /**
     * show confirm dialog
     *
     * @param {string} title, title of the dialog
     * @return {deferred} promise, use .done .fail to add confirm cancel handler
     *
     */
    ui.confirm_dialog = function(title, content) {
        return new ui.Dialog({
            title: title || _('Are you sure?'),
            content: content,
            buttons: ['confirm', 'cancel']
        });
    }

    /**
     * show compose dialog
     * this dialog has an additional method 'val',
     * which can be used to set/get the text content.
     */
    ui.compose_dialog = function(title, content) {
        var text = $('<textarea/>');
        text.val(content);
        var dialog = new ui.Dialog({
            title: title || _('No title'),
            content: text,
            buttons: ['publish', 'cancel']
        });
        dialog.val = $.proxy(text.val, text);
        return dialog;
    }

    ui.prompt_dialog = function(title, content) {
        var text = $('<input/>').attr('type', 'text');
        text.val(content);
        text.css('width', '100%');
        var dialog = new ui.Dialog({
            title: title || _('No title'),
            content: text,
            buttons: ['confirm', 'cancel']
        });
        dialog.val = $.proxy(text.val, text);
        return dialog;
    }

    ui.select_dialog = function(title, list) {
        var ol = $('<ol/>');
        $.each(list, function(i, e) {
            var li = $('<li/>').text(e);
            var input = $('<input/>').attr('type', 'checkbox');
            input.data('seq', i);
            input.prependTo(li);
            li.appendTo(ol);
        });
        var dialog = new ui.Dialog({
            title: title || _('No title'),
            content: ol,
            buttons: ['confirm', 'cancel']
        });
        dialog.val = function() {
            var ret = [];
            ol.find('input[type=checkbox]:checked').each(function(i, e) {
                ret.push($(e).data('seq'));
            });
            return ret;
        }
        return dialog;
    }

})('U', jQuery);

/**
 * simple tabs.
 */
(function(name, $) {
    var ui = window[name] = window[name] || {};

    ui.Tabs = function(container) {
        this.container = $(container);
        this.tabbar = this.container.children('.tabbar');
    };

    $.extend(ui.Tabs.prototype, {
        /**
         * change current tab or bind change handler
         */
        change: function(fn) {
            if (typeof(fn) === 'string') {
                var old = this.current();
                var target = fn;

                this.tabbar.children('.tabtitle').removeClass('target');
                this.container.children('.tabcontent').hide();

                var title = this.tabbar.find('.tabtitle[data-name=' + target + ']');
                title.addClass('target');
                this.container.children('.tabcontent.' + title.data('for')).show();

                this.container.trigger('tau-tab-change', [target, old]);
            } else {
                this.container.bind('tau-tab-change', fn);
            }
        },
        /**
         * get current tab name
         */
        current: function() {
            return this.tabbar.children('.tabtitle.target').data('name');
        }
    });

    ui.tabs = function(container) {
        return new ui.Tabs(container);
    };

})('U', jQuery);

// vim: set et ts=4 sw=4 tw=0 :
