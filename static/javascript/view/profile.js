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
                if (T.checkLogin() == cur_uid) {
                    t.find('.follow-button').hide();
                } else {
                    U.FollowButton(t.find('.follow-button'));
                }
                streams['timeline'] = new U.PostStream('div.timeline_wrapper', {
                    uid: cur_uid,
                    type: 'user'
                }, {
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

                T.get_lists({uid: cur_uid}).success(function(r) {
                    $(r.items).each(function(i, e) {
                        e['photo'] = d.photo;
                    });
                    var ul = $('<ul/>').addClass('liststream');
                    U.render('list_item', r.items).fillTo(ul).done(function() {
                        $('.list_wrapper').html(ul);
                        $('.delete', ul).click(function(e) {
                            var li = $(e.target).parents('.liststream>li');
                            U.confirm_dialog(_('Are you sure you want to delete?')).done(function(button) {
                                if (button == 'confirm') {
                                    T.remove_list({
                                        id: li.data('id')
                                    }).success(function() {
                                        li.remove();
                                        U.success(_('delete list succeeded'));
                                    });
                                }
                            });
                        });
                    });
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
                
                // prevent undefined reference for button.active 
                buttons['list'] = new U.AutoLoadButton(
                    '.list_wrapper',
                    function() {
                        return $.Deferred().resolve(false);
                    }
                );

            }).done(loadDeferred.resolve);
        });
    };

    R.path('u', {
        enter: function(){
            if (!T.checkLogin()) {
                R.path('public');
                return false;
            } else {
                U.PAGE.header.show();
            }
            return true;
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

