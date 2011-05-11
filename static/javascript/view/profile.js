// for user profile page, need post_stream.js
// path ~ tau/#u/ztrix

(function(name, $){
    var loadDeferred;

    var streams = {};
    var buttons = {};

    var load_profile = function() {
        var cur_uid = R.path()[1] || T.checkLogin();
        T.userinfo({uid: cur_uid}).success(function(d) {
            U.render('profile', d).fillTo('#main').done(function(t) {
                U.FollowButton(t.find('.follow-button'))
                streams['timeline'] = new U.PostStream('div.timeline_wrapper', {
                    uid: cur_uid,
                    type: 'user'
                }, {
                    listen_scroll: false,
                    auto_fresh: false
                });

                streams['following'] = new U.UserStream('div.following_wrapper', {
                    uid: cur_uid,
                    type: 'following'
                });

                streams['follower'] = new U.UserStream('div.follower_wrapper', {
                    uid: cur_uid,
                    type: 'follower'
                });

                buttons['timeline'] = new U.AutoLoadButton(
                    '.timeline_wrapper',
                    function() {
                        return streams['timeline'].update('older');
                    }
                );
                buttons['following'] = new U.AutoLoadButton(
                    '.following_wrapper',
                    function() {
                        return streams['following'].load_more();
                    }
                );
                buttons['follower'] = new U.AutoLoadButton(
                    '.follower_wrapper',
                    function() {
                        return streams['follower'].load_more();
                    }
                );

            }).done(loadDeferred.resolve);
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
            if (!path[1]) {
                R.path('home');
            }

            if (level <= 1) {
                loadDeferred = $.Deferred();
                load_profile();
            }

            loadDeferred.done(function() {
                var target = path[2] || 'timeline';
                $.each(buttons, function(key, button) {
                    button.active(false);
                });
                buttons[target].active(true);
                U.tabs('#profiletabs').change(target);
            });
        },
        leave: function(){
        }
    });

})('PROFILE', jQuery);

