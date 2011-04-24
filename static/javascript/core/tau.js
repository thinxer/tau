/*
 * The tau api module.
 */
(function(name) {
    var tau = window[name] = {};

    // Set up basic api calls.
    // Usage:
    //  T.login({uid: 'foo', password: 'bar'}).success(fn)
    //  T.steam().success(fn)
    // while fn = function(data) {}
    //
    // For more information, please refer to API SPEC in server code
    var get_methods = 'stream userinfo current_user get_message validate get_following get_follower'.split(' ');
    var post_methods = 'register login logout publish follow unfollow update_profile'.split(' ');
    jQuery(get_methods).each(function(i, t) {
        tau[t] = function(param) {
            return jQuery.getJSON('/api/' + t, param);
        };
    });
    jQuery(post_methods).each(function(i, t) {
        tau[t] = function(param) {
            return jQuery.post('/api/' + t, param, null, 'json');
        };
    });

    tau.checkLogin = function() {
        return jQuery.cookie('uid');
    };

    var orig_login = tau.login;
    tau.login = function(param) {
        return orig_login(param).success(function(d) {
            jQuery.cookie('uid', d.uid);
        });
    };

    var orig_logout = tau.logout;
    tau.logout = function(param) {
        return orig_logout(param).success(function() {
            jQuery.cookie('uid', null);
        });
    };

})('T');

// vim: set et ts=4 sw=4 tw=0 :
