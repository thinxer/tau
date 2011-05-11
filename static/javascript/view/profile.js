// for user profile page, need post_stream.js
// path ~ tau/#u/ztrix

(function(name, $){
    var K = window.K = window.K || {}, C = window.C = window.C || {};
    var c = C[name] = {}, u = U[name] = {};

    var cur_uid;
    var stream;
    var loadDeferred;

    var handler = {};

    var load_profile = function() {
        T.userinfo({uid: cur_uid}).success(function(d) {
            U.render('profile', d, {}).fillTo('#main').done(loadDeferred.resolve);
        });
    };

    handler.timeline = function() {
        stream = new U.PostStream('div.timeline_wrapper', {
            uid: cur_uid,
            type: 'user'
        }, {
            listen_scroll: false,
            auto_fresh: false
        });
        stream.start();
    }

    handler.following = function() {
        stream = new U.UserStream('div.following_wrapper', {
            uid: cur_uid
        });
    };

    handler.follower = function() {
        stream = new U.UserStream('div.follower_wrapper', {
            uid: cur_uid,
            type: 'follower'
        });
    };

    var handle_scroll = function() {
        if ($(window).scrollTop() > $('#profiletabs').height() +
                                    $('#profiletabs').position().top -
                                    $(window).height() - 20) {
            if (stream && stream.onScroll) {
                stream.onScroll('bottom');
            }
        }
    };

    R.path('u', {
        enter: function(){
            U.PAGE.header.show();
            if (!T.checkLogin()) {
                R.path('public');
            }
            $(window).scroll(handle_scroll);
        },
        change: function(path, oldPath, level){
            cur_uid = path[1] || T.checkLogin();
            if (!cur_uid) {
                R.path('home');
            }

            if (level <= 1) {
                loadDeferred = $.Deferred();
                load_profile();
            }

            // unbind live
            if (stream && stream.end) {
                stream.end();
            }

            loadDeferred.done(function() {
                var target = path[2] || 'timeline';
                handler[target]
                U.tabs('#profiletabs').change(target);
            });
        },
        leave: function(){
            if (stream && stream.end) {
                stream.end();
            }
            $(window).unbind('scroll', handle_scroll);
        }
    });

})('PROFILE', jQuery);

