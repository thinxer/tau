// for user profile page, need post_stream.js
// path ~ tau/#u/ztrix

(function(name, $){
    var K = window.K = window.K || {}, C = window.C = window.C || {};
    var c = C[name] = {}, u = U[name] = {};

    var cur_uid;
    var stream;
    var loadDeferred = $.Deferred();

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
        });
        stream.start();
        stream.update();
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

    R.path('u', {
        enter: function(){
            U.PAGE.header.show();
            if (!T.checkLogin()) {
                R.path('public');
            }
        },
        change: function(path, oldPath, level){
            cur_uid = path[1] || T.checkLogin();
            if (!cur_uid) {
                R.path('home');
            }

            if (level <= 1) {
                load_profile();
            }

            loadDeferred.done(function() {
                var target = path[2] || 'timeline';
                handler[target]
                U.tabs('#profiletabs').change(target);
            });
        },
        leave: function(){
            if (stream) {
                stream.end();
            }
        }
    });

})('PROFILE', jQuery);

