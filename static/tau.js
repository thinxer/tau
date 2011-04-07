/*
 * The tau api module.
 */
(function(name) {
    var tau = window[name] = {};

    // set up basic api calls
    var get_methods = 'stream userinfo'.split(' ');
    var post_methods = 'register login logout public'.split(' ');
    jQuery(get_methods).each(function(i, t) {
        tau[t] = function(param) {
            return jQuery.getJSON('/api/' + t, param);
        };
    });
    jQuery(post_methods).each(function(i, t) {
        tau[t] = function(param) {
            return jQuery.post('/api/' + t, param, 'json');
        };
    });

    // Check if there is a user logged in.
    tau.checkLogin = function() {
        return !!jQuery.cookie('username');
    };

})('T');
