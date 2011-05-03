// for user profile page
// path ~ tau/#u/ztrix

(function(name, $){
    var K = window.K = window.K || {}, C = window.C = window.C || {};
    var c = C[name] = {}, u = U[name] = {};

    var cur_uid;
    var updating = false;

    var updateStream = function(){
        if (updating) return;
        updating = true;

        var p = {uid: cur_uid};
        if ($('ol.timeline>li').last().attr('data-hasmore')) {
            p.olderThan = +$('ol.timeline>li .timestamp').last().attr('data-timestamp');
        }
        T.stream(p).success(function(r) {
            $(r.items).each(function(i, e) {
                e['user'] = r.users[e.uid];
            });
            U.render('stream_item', r.items, {
                getDate: C.HOME.getReadableDate,
                getName: function(uid, name){   // TODO: use name or uid ? 
                    if (name && name.length > 0) return name;
                    return uid;
                },
                isCurUser: function(d) {
                    return true;
                }
            }).appendTo('ol.timeline').done(function(t){
                if (r.has_more) {
                    t.last().attr('data-hasmore', 'true');
                } else {
                    $(document).unbind('scroll');
                }
                updating = false;
            });
        });
    };

    var getDataAndShow = function(){
        if (!cur_uid) {
            // TODO: handle this with robustness
            alert('error: cannot get current uid ');
            return;
        }
        T.userinfo({uid: cur_uid}).success(function(d){
            U.render('profile', d, { }).fillTo('#main').done(updateStream);
        });
    };

    var setupClick = function(){
        $('ol.timeline a.delete').live('click', function(){
            var item = $(this).parents('ol.timeline>li.item');
            var msgid = $(item).find('div.content').attr('data-id');
            T.remove({msg_id: msgid}).success(function(r){
                if (r.success) {
                    item.remove();
                    U.success(_('delete succeeded'), 1000);
                } else {
                    U.error(_('delete failed'), 1500);
                }
            });
            return false;
        });
    };

    R.path('u', {
        enter: function(){
            U.PAGE.header.show();
            if (!T.checkLogin()) {
                // TODO: should we show this page like sina do when not logged in ? 
                R.path('public');
            } else {
                if (R.path().length > 1) {
                    cur_uid = R.path()[1];
                } else {
                    // TODO: WTF ?
                }
                getDataAndShow();
                $(document).scroll(function(){
                    if ($(window).scrollTop() > $(document).height() - $(window).height() - 20) {
                        if ($('ol.timeline>li').last().attr('data-hasmore')) {
                            updateStream();
                        }
                    }
                });
                setupClick();
            }
        },
        leave: function(){
            $(document).unbind('scroll');
            $('ol.timeline a.delete').die('click');
        }
    });

})('PROFILE', jQuery);
