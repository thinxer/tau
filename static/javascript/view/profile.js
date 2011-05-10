// for user profile page, need post_stream.js
// path ~ tau/#u/ztrix

(function(name, $){
    var K = window.K = window.K || {}, C = window.C = window.C || {};
    var c = C[name] = {}, u = U[name] = {};

    var cur_uid;
    var stream;
    var loadDeferred = $.Deferred();

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
            }).done(loadDeferred.resolve);
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
        change: function(path, oldPath, level){
            if (path.length > 1) {
                cur_uid = path[1];
            } else {
                R.path('home');
            }

            if (level <= 1) {
                loadDeferred = jQuery.Deferred();
                getDataAndShow();
            }

            loadDeferred.done(function() {
                var target = path[2] || 'timeline';

                var container = $('#profiletabs');
                var tabbar = container.children('.tabbar');

                tabbar.children('.tabtitle').removeClass('target');
                container.children('.tabcontent').hide();

                var title = tabbar.find('.tabtitle[data-name=' + target + ']');
                title.addClass('target');
                container.children('.tabcontent.' + title.data('for')).show();
            });
        },
        leave: function(){
            if (stream) {
                stream.end();
            }
        }
    });

})('PROFILE', jQuery);

