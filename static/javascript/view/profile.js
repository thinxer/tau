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
            U.render('profile', d, { }).fillTo('#main').done(function(){
                C.POST_STREAM.updateStream(0, {uid: cur_uid});
            });
        });
    };

    R.path('u', {
        enter: function(){
            U.PAGE.header.show();
            var uid = T.checkLogin();
            if (!uid) {
                // TODO: should we show this page like sina do when not logged in ? 
                R.path('public');
                return;
            }
            C.POST_STREAM.start();
            $(document).scroll(function(){
                if ($(window).scrollTop() > $(document).height() - $(window).height() - 20) {
                    if ($('ol.timeline>li').last().attr('data-hasmore')) {
                        C.POST_STREAM.updateStream(-1, {uid: cur_uid});
                    }
                }
            });
        },
        change: function(r){
            console.log(r);
            if (r.length > 1) {
                cur_uid = r[1];
            } else {
                R.path('home');
            }
            getDataAndShow();
        },
        leave: function(){
            $(document).unbind('scroll');
            C.POST_STREAM.end();
        }
    });

})('PROFILE', jQuery);

