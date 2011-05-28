// for user profile page, need post_stream.js
// path ~ tau/#u/ztrix

(function(name, $){
    var loadDeferred;

    var streams = {};
    var buttons = {};

    var user_info;      // the user whose profile being viewed
    var login_user_list;    // current login user list

    var update_list = function() {
        T.get_lists({uid: user_info.uid}).success(function(r) {
            if (user_info.is_login_user) {
                login_user_list = r;
            }
            $('#profile .social_info #list_number').text(r.items.length);
            $(r.items).each(function(i, e) {
                e['photo'] = user_info.photo;
            });
            var ul = $('<ul/>').addClass('liststream');
            U.render('list_item', r.items).fillTo(ul)
                                          .done(function() {
                $('.list_wrapper').html(ul);
                $('.delete', ul).click(function(e) {
                    var li = $(e.target).parents('.liststream>li');
                    U.confirm_dialog(_('Are you sure you want to delete?'))
                     .done(function(button) {
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
    }

    var load_profile = function() {
        var cur_uid = R.path()[1] || T.checkLogin();
        T.userinfo({uid: cur_uid}).success(function(d) {
            user_info = d;
            d['is_login_user'] = d.uid == T.checkLogin();
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

                update_list();

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
                
                if (!user_info.is_login_user) {
                    // load login user's list
                    T.get_lists({
                        uid: T.checkLogin()
                    }).success(function(list) {
                        login_user_list = list;
                    });
                }
            
                // attach event
                $('#profile .button.create_list').click(function() {
                    var dialog = U.prompt_dialog(_('input list name'));
                    dialog.done(function(button) {
                        if (button == 'confirm' && dialog.val()) {
                            T.create_list({
                                name: dialog.val()
                            }).success(function(rs) {
                                if (rs.list_id) {
                                    update_list();
                                    U.success(_('create list succeeded'));
                                }
                            });
                        }
                    });
                });

                $('#profile .button.addto_list').click(function() {
                    var list = [];
                    $(login_user_list.items).each(function(i, e) {
                        list.push(e.name);
                    });
                    var dialog = U.select_dialog(_('add to list'), list);
                    dialog.done(function(button) {
                        if (button == 'confirm') {
                            var count = 0;
                            var val = dialog.val();
                            $.each(val, function(i, e) {
                                T.add_to_list({
                                    uid: user_info.uid,
                                    id: login_user_list.items[e].id
                                }).success(function(rs) {
                                    if (rs.success) {
                                        count++;
                                    }
                                    if (i == val.length - 1 && count) {
                                        U.success(_('friends added to your %d list', count));
                                        update_list();
                                    }
                                });
                            });
                        }
                    });
                });

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

