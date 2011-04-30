// for user profile page
// path ~ tau/#u/ztrix

(function(name){
    var K = window.K = window.K || {}, C = window.C = window.C || {};
    var c = C[name] = {}, u = U[name] = {};

    var cur_uid;

    var getDataAndShow = function(){
        if (!cur_uid) {
            // TODO: handle this with robustness
            alert('error: cannot get current uid ');
            return;
        }
        T.userinfo({uid: cur_uid}).success(function(d){
            U.render('profile', d, { }).fillTo('#main');
        });
    };
    
    R.path('u', {
        enter: function(){
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
            }
        },
        leave: function(){

        }
    });

})('PROFILE');
