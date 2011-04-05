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
     * Returns a jQuery object.
     */
    ui.tmpl = function(name, data) {
        return jQuery.tmpl(name, data);
    };

    /* 
     * Apply the named template to the target with the given data.
     * Usage:
     *      ui.tmpl('main', function() {
     *          this.appendTo('#wrapper');
     *      });
     */
    ui.tmpl2 = function(name, data, fn) {
        if (typeof fn === 'undefined') {
            fn = data;
            data = null;
        }
        var apply_tmpl = function() {
            var t = ui.tmpl(name, data);
            fn.call(t);
        };

        if (ui.template[name]) {
            apply_tmpl();
        } else {
            ui.load(name).success(function() {
                apply_tmpl();
            });
        }
    };

})('U');
