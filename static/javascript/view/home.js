// for home.html, need post_stream.js

(function(name, $){
    var K=window.K=window.K||{},C=window.C=window.C||{};
    var c=C[name]={},u=U[name]={};

    var cur_user;

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
                C.POST_STREAM.updateStream(1);
            }).error(function(){
            });
        };
        $('.pub_btn').click(publish);
        $('#publisher').keypress(function(e){
            if(e.ctrlKey && (e.keyCode==13 || e.keyCode==10)){
                publish();
            }
        });
        C.POST_STREAM.start();
    };

    var nextRecSelector = 'div.user_recommendation .next';
    var prevRecSelector = 'div.user_recommendation .prev';

    var renderRecommendation = function(d){
        $(d).each(function(i, d){
            d.seq = i;
        });
        if (d.length > 0){
            U.render('recommendation_item', d).fillTo('ol.recommendation_list');
        }else{
            $('ol.recommendation_list').children().remove();
        }
    };
    var showRecommendation = function(){
        T.recommend_user().success(function(r){
            if (r.error) {
                alert(r.desc);
                if (r.error == -1){
                    R.path('public');
                }
                return;
            }
            r = r.users;
            var it = 0;
            var d = r.slice(it, it+3);
            if (!d.length){
                return;
            }
            var showBtn = function(){
                if (!it){
                    $(prevRecSelector).css('display', 'none');
                }else{
                    $(prevRecSelector).css('display', 'block');
                }
                if (r.length > it+3){
                    $(nextRecSelector).css('display', 'block');
                }else{
                    $(nextRecSelector).css('display', 'none');
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
            $('ol.recommendation_list a').live('click', function(){
                var curli = $(this).parents('ol.recommendation_list>li');
                var uid = ($(this).siblings('div').text());
                T.follow({uid: uid}).success(function(){
                    U.success(_('following'));
                    var curseq = +curli.attr('data-seq');
                    curli.remove();
                    r = $.merge(r.slice(0, it+curseq),r.slice(it+curseq+1,r.length));
                    it = it < r.length ? it : (r.length > 3 ? r.length-3 : 0);
                    d = r.slice(it, it+3);
                    if (d.length > 0){
                        renderRecommendation(d);
                        showBtn();
                    }else{
                        $(nextRecSelector).css('display', 'none');
                        $(prevRecSelector).css('display', 'none');
                    }
                });
            });
        });
    };

    start=function(curuser){
        U.PAGE.header.show();
        setupClick();
        C.POST_STREAM.updateStream(0);
        $(document).scroll(function(){
            if($(window).scrollTop() > $(document).height()-$(window).height()-20){
                if($('ol.timeline>li').last().attr('data-hasmore')){
                    C.POST_STREAM.updateStream(-1);
                }
            }
        });
        showRecommendation();
    };

    end = function(){
        $(document).unbind('scroll');
        $('ol.recommendation_list a').die('click');
        C.POST_STREAM.end();
    };

    R.path('home', {
        enter: function() {
            if (!T.checkLogin()) {
                R.path('public');
            } else {
                T.current_user().success(function(d) {
                    cur_user = d;
                    C.POST_STREAM.setCurUser(d);
                    U.render('home', d).fillTo('#main').done(start);
                });
            }
        },
        leave: end
    });

})('HOME', jQuery);

