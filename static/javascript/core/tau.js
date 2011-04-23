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

})('T');

// vim: set et ts=4 sw=4 tw=0 :
