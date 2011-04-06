/*
 * The tau api module.
 */
(function(name) {
    var tau = window[name] = {};

    // Check if there is a user logged in.
    tau.checkLogin = function() {
        return !!jQuery.cookie('username');
    };

    tau.getCurrentUser = function(fn) {
        return jQuery.getJSON('/api/userinfo');
    };

})('T');
