// for home.html

(function(name, $){
    var K=window.K=window.K||{},C=window.C=window.C||{};
    var c=C[name]={},u=U[name]={};

    c.getReadableDate = function(m){
        var d=new Date(m),now=$.now(),delta=now-d;
        if(delta<3600000){
            return Math.round(delta/60000) + ' ' + _('minutes ago');
        }else if(delta<86400000){
            return Math.round(delta/3600000) + ' ' + _('hours ago');
        }else if(delta<259200000){      //three days
            return Math.round(delta/86400000) + ' ' + _('days ago');
        }
        return new Date(m).toLocaleDateString();
    };

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
                updateStream(1);
            }).error(function(){
            });
        };
        $('.pub_btn').click(publish);
        $('#publisher').keypress(function(e){
            if(e.ctrlKey && (e.keyCode==13 || e.keyCode==10)){
                publish();
            }
        });
        $('ol.timeline a.delete').live('click', function(){
            var item = $(this).parents('ol.timeline>li.item');
            var msgid = $(item).find('div.content').attr('data-id');
            T.delete({msg_id: msgid}).success(function(r){
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
    // when > 0 means newer, when =0 means all, when < 0 means older
    var callStreamAPI=function(when){
        var p={};
        if ($('ol.timeline').children().length) {
            if(when>0){
                p.newerThan=+$('ol.timeline>li .timestamp').first().attr('data-timestamp');
            }else if(when<0){
                p.olderThan=+$('ol.timeline>li .timestamp').last().attr('data-timestamp');
            }
        }
        var d = $.Deferred();
        T.stream(p).success(function(r){
            $(r.items).each(function(i,e){
                e['user']=r.users[e.uid];
            });
            d.resolve(r.items,r.has_more);
        });
        return d;
    };

    var updating = false;

    // when > 0 means newer, when =0 means all, when < 0 means older
    var updateStream=function(when){
        if (updating) return;
        updating = true;
        var d = callStreamAPI(when);
        d.done(function(d,hasmore){
            var o=U.render('stream_item',d,{
                getDate: c.getReadableDate,
                isCurUser: function(d){
                    return d == cur_user.uid;
                }
            });
            o.done(function(t){
                if(hasmore){
                    t.last().attr('data-hasmore','true');
                } else {
                    $(document).unbind('scroll');
                }
                updating = false;
            });
            if(!when) $('ol.timeline').html('');
            if(when>0) o.prependTo('ol.timeline');
            else o.appendTo('ol.timeline');
        });
        return d;
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
                    U.success("关注成功");
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
        updateStream(0);
        $(document).scroll(function(){
            if($(window).scrollTop() > $(document).height()-$(window).height()-20){
                if($('ol.timeline>li').last().attr('data-hasmore')){
                    updateStream(-1);
                }
            }
        });
        showRecommendation();
    };

    end=function(){
        $(document).unbind('scroll');
        $('ol.recommendation_list a').die('click');
        $('ol.timeline a.delete').die('click');
    };

    R.path('home', {
        enter: function() {
            if (!T.checkLogin()) {
                R.path('public');
            } else {
                T.current_user().success(function(d) {
                    cur_user = d;
                    U.render('home', d).fillTo('#main').done(start);
                });
            }
        },
        leave: end
    });

})('HOME', jQuery);

