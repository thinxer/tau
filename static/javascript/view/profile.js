// for user profile page, need post_stream.js
// path ~ tau/#u/ztrix

(function(name, $){
    var K = window.K = window.K || {}, C = window.C = window.C || {};
    var c = C[name] = {}, u = U[name] = {};

    var cur_uid;
    var updating = false;

    var getDataAndShow = function(){
        if (!cur_uid) {
            // TODO: handle this with robustness
            alert('error: cannot get current uid ');
            return;
        }
        T.userinfo({uid: cur_uid}).success(function(d){
            C.POST_STREAM.setCurUser(d);
            U.render('profile', d, { }).fillTo('#main').done(function(){
                C.POST_STREAM.updateStream(0, {uid: cur_uid});
            });
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
                    if (cur_uid == R.path()[1]) {
                            return;
                    } else {
                        cur_uid = R.path()[1];
                    }
                } else {
                    // TODO: WTF ?
                }
                getDataAndShow();
                $(document).scroll(function(){
                    if ($(window).scrollTop() > $(document).height() - $(window).height() - 20) {
                        if ($('ol.timeline>li').last().attr('data-hasmore')) {
                            C.POST_STREAM.updateStream(-1, {uid: cur_uid});
                        }
                    }
                });
                C.POST_STREAM.start();
            }
        },
        leave: function(){
            $(document).unbind('scroll');
            C.POST_STREAM.end();
        }
    });

})('PROFILE', jQuery);
