// for user profile page, need post_stream.js
// path ~ tau/#u/ztrix

(function(name, $){
    var K = window.K = window.K || {}, C = window.C = window.C || {};
    var c = C[name] = {}, u = U[name] = {};

    var cur_uid;
    var stream;

    var getDataAndShow = function(){
        if (!cur_uid) {
            // TODO: handle this with robustness
            alert('error: cannot get current uid ');
            return;
        }
        T.userinfo({uid: cur_uid}).success(function(d){
            U.render('profile', d, { }).fillTo('#main').done(function(){
                stream = new U.PostStream('div.timeline_wrapper', {
                    uid: cur_uid,
                    type: 'user'
                });
                stream.start();
                stream.update();
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
        },
        change: function(r){
            if (r.length > 1) {
                cur_uid = r[1];
            } else {
                R.path('home');
            }
            getDataAndShow();
        },
        leave: function(){
            if (stream) {
                stream.end();
            }
        }
    });

})('PROFILE', jQuery);

