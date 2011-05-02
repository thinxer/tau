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
    var get_methods = 'stream userinfo current_user get_message validate get_following get_follower recommend_user'.split(' ');
    var post_methods = 'register login logout publish delete follow unfollow update_profile'.split(' ');
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

    var wrap = function(name, success, fail) {
        var orig_fn = tau[name];
        tau[name] = function(param) {
            return orig_fn(param).then(success, fail);
        };
    };

    // allow check login quickly
    tau.checkLogin = function() {
        return jQuery.cookie('uid');
    };

    wrap('login', function(d) {
        jQuery.cookie('uid', uid);
    });

    wrap('logout', function(d) {
        jQuery.cookie('uid', null);
    });

    // calibrate client time
    var time_diff = 0;
    wrap('stream', function(d, textStatus, xhr) {
        try {
            var serverTime = new Date(xhr.getResponseHeader('Date'));
            var clientTime = new Date();
            time_diff = serverTime - clientTime;
        } catch (e) {}
    });

    tau.getServerTime = function(clientTime) {
        return clientTime + time_diff;
    };

})('T');

// vim: set et ts=4 sw=4 tw=0 :
