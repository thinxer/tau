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
            U.render('profile', d, { }).fillTo('#main').done(function(){
                T.stream({uid: cur_uid}).success(function(r){
                    $(r.items).each(function(i, e){
                        e['user'] = r.users[e.uid];
                    });
                    U.render('stream_item', r.items, {
                       getDate: C.HOME.getReadableDate
                    }).appendTo('ol.timeline').done(function(t){
                        if (r.has_more) {
                            t.last().attr('data-hasmore', 'true');
                        }
                    });
                });
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
