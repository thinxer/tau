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
    var get_methods = 'stream userinfo current_user'.split(' ');
    var post_methods = 'register login logout publish follow unfollow'.split(' ');
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

})('T');
