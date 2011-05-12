// for home.html, need post_stream.js

(function(name, $){
    var K=window.K=window.K||{},C=window.C=window.C||{};
    var c=C[name]={},u=U[name]={};

    var cur_user;   // object
    var streams = {};
    var buttons = {};

    var batchAction = function(array, action, param) {
        $.each(array, function(i, e) {
            e[action](param);
        });
    }

    var setupClick=function(){
        var publish=function(){
            var o=$('textarea#publisher'),v = $.trim(o.val());
            if(!v.length){
                // TODO: show error ?
                return;
            }
            T.publish({content: v}).success(function(){
                o.val('');
                U.success(_('post succeeded') + _('!'), 1000);
                batchAction(streams, 'update', 'newer');
            }).error(function(){
            });
        };
        $('.pub_btn').click(publish);
        $('#publisher').keypress(function(e){
            if(e.ctrlKey && (e.keyCode==13 || e.keyCode==10)){
                publish();
            }
        });
        $('#main .search button').click(function() {
            var p = $('#main .search input').val();
            R.path('search/search_stream/'+p);
        });
    };

    var nextRecSelector = 'div.user_recommendation .next';
    var prevRecSelector = 'div.user_recommendation .prev';

    var renderRecommendation = function(d){
        if (!d) d = [];
        $(d).each(function(i, d){
            d.seq = i;
        });
        if (d.length > 0) {
            U.render('recommendation_item', d).fillTo('.recommendation_list').done(function(t) {
                U.FollowButton(t.find('.follow-button'));
            });
            $('.user_recommendation').css('display', 'block');
        } else {
            $('.recommendation_list').children().remove();
            $('.user_recommendation').css('display', 'none');
        }
    };
    var showRecommendation = function(){
        renderRecommendation();
        T.recommend_user().success(function(r) {
            if (r.error) {
                $('.recommendation_list').remove();
                return;
            }
            r = r.users;
            var it = 0;
            var d = r.slice(it, it+3);
            if (!d.length){
                return;
            }
            var showBtn = function() {
                if (!it) {
                    $(prevRecSelector).attr('disabled', true);
                } else {
                    $(prevRecSelector).removeAttr('disabled');
                }
                if (r.length > it+3) {
                    $(nextRecSelector).removeAttr('disabled');
                } else {
                    $(nextRecSelector).attr('disabled', true);
                }
            };
            showBtn();
            renderRecommendation(d);
            $(prevRecSelector).click(function(){
                it = it > 3 ? it - 3 : 0;
                showBtn();
                renderRecommendation(r.slice(it, it+3));
            });
            $(nextRecSelector).click(function(){
                it += 3;
                showBtn();
                renderRecommendation(r.slice(it, it+3));
            });
        }).error(function() {
            renderRecommendation();
        });
    };

    var setupStreams = function() {
        $('timeline mentions'.split(' ')).each(function(i, e) {
            var opt = e == 'mentions' ? {
                type: e,
                uid: cur_user.uid
            } : null;
            streams[e] = new U.PostStream('div.' + e + '_wrapper', opt);
            streams[e].start();

            buttons[e] = new U.AutoLoadButton(
                '.' + e + '_wrapper',
                function() {
                    return streams[e].update('older');
                }
            );
        });
    };

    var end = function(){
        batchAction(streams, 'end');
    };

    R.path('home', {
        loadDeferred: null,
        enter: function() {
            if (!T.checkLogin()) {
                R.path('public');
            } else {
                U.PAGE.header.show();
                var self = this;
                self.loadDeferred = $.Deferred();
                T.current_user().success(function(d) {
                    cur_user = d;
                    U.render('home', d)
                        .fillTo('#main')
                        .done(function() {
                            setupClick();
                            showRecommendation();
                            setupStreams();
                        })
                        .done(self.loadDeferred.resolve);
                });
            }
        },
        change: function(path, oldPath, level) {
            this.loadDeferred.done(function() {
                var target = path[1] || 'timeline';

                $.each(buttons, function(i, e) {
                    e.active(false);
                });
                buttons[target].active(true);

                U.tabs('#streamtabs').change(target);
            });
        },
        leave: end
    });

})('HOME', jQuery);

