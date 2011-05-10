// for home.html, need post_stream.js

(function(name, $){
    var K=window.K=window.K||{},C=window.C=window.C||{};
    var c=C[name]={},u=U[name]={};

    var cur_user;
    var stream;

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
                stream.update('newer');
            }).error(function(){
            });
        };
        $('.pub_btn').click(publish);
        $('#publisher').keypress(function(e){
            if(e.ctrlKey && (e.keyCode==13 || e.keyCode==10)){
                publish();
            }
        });
        stream.start();
    };

    var nextRecSelector = 'div.user_recommendation .next';
    var prevRecSelector = 'div.user_recommendation .prev';

    var renderRecommendation = function(d){
        if (!d) d = [];
        $(d).each(function(i, d){
            d.seq = i;
        });
        if (d.length > 0) {
            U.render('recommendation_item', d).fillTo('.recommendation_list');
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
            $('.recommendation_list a').live('click', function(){
                var curli = $(this).parents('.recommendation_list>li');
                var uid = ($(this).siblings('div').text());
                T.follow({uid: uid}).success(function(){
                    U.success(_('follow succeeded'));
                    var curseq = +curli.attr('data-seq');
                    curli.remove();
                    r = $.merge(r.slice(0, it+curseq),r.slice(it+curseq+1,r.length));
                    it = it < r.length ? it : (r.length > 3 ? r.length-3 : 0);
                    d = r.slice(it, it+3);
                    if (d.length > 0) {
                        renderRecommendation(d);
                        showBtn();
                    } else {
                        $(nextRecSelector).css('display', 'none');
                        $(prevRecSelector).css('display', 'none');
                    }
                });
            });
        }).error(function() {
            renderRecommendation();
        });
    };

    start = function(curuser){
        U.PAGE.header.show();
        stream = new U.PostStream('div.timeline_wrapper');
        setupClick();
        showRecommendation();
    };

    end = function(){
        $('.recommendation_list a').die('click');
        stream.end();
    };

    R.path('home', {
        loadDeferred: $.Deferred(),
        enter: function() {
            if (!T.checkLogin()) {
                R.path('public');
            } else {
                var self = this;
                T.current_user().success(function(d) {
                    cur_user = d;
                    U.render('home', d)
                        .fillTo('#main')
                        .done(start)
                        .done(self.loadDeferred.resolve);
                });
            }
        },
        change: function(path, oldPath, level) {
            this.loadDeferred.done(function() {
                var target = path[1] || 'timeline';

                // TODO The following tab switch logic can be abstracted.
                var container = $('#streamtabs');
                var tabbar = container.children('.tabbar');

                tabbar.children('.tabtitle').removeClass('target');
                container.children('.tabcontent').hide();

                var title = tabbar.find('.tabtitle[data-name=' + target + ']');
                title.addClass('target');
                container.children('.tabcontent.' + title.data('for')).show();
            });
        },
        leave: end
    });

})('HOME', jQuery);

