// for stream_iteam, used by home page, profile page

(function(name, $){
    var C = window.C = window.C || {}, U = window.U = window.U || {};
    var c = C[name] = {}, u = U[name] = {};

    var cur_user;

    // ! must set cur_user before using POST_STREAM
    c.setCurUser = function(u) {
        cur_user = u;
    }

    c.getReadableDate = function(m){
        var d = new Date(m), now = T.getServerTime(jQuery.now()), delta = now - d;
        if (delta < 3600000){
            return Math.round(delta/60000) + ' ' + _('minutes ago');
        } else if (delta < 86400000){
            return Math.round(delta/3600000) + ' ' + _('hours ago');
        } else if (delta < 259200000){      //three days
            return Math.round(delta/86400000) + ' ' + _('days ago');
        }
        return new Date(m).toLocaleDateString();
    };

    // when > 0 means newer, when == 0 means all, when < 0 means older
    var callStreamAPI = function(when, option){
        var p = option || {};
        if ($('ol.timeline').children().length) {
            if (when > 0){
                p.newerThan = +$('ol.timeline>li .timestamp').first().attr('data-timestamp');
            } else if (when < 0){
                p.olderThan = +$('ol.timeline>li .timestamp').last().attr('data-timestamp');
            }
        }
        var d = $.Deferred();
        T.stream(p).success(function(r){
            var data = [];
            $(r.items).each(function(i, e){
                var isCurUser = cur_user.uid == e.uid;
                e.showDelete = isCurUser;
                e.showForward = !isCurUser;
                if (e.type == 'normal') {
                    data.push($.extend(e, {
                        user: r.users[e.uid],
                    }));
                } else if(e.type == 'forward') {
                    data.push($.extend(e, {
                        user: r.users[e.parent_message.uid],
                        content: e.parent_message.content
                    }));
                } else if (e.type == 'reply') {
                    // TODO: add reply logic
                }
            });
            d.resolve(data, r.has_more);
        });
        return d;
    };

    var updating = false;
    // when > 0 means newer, when == 0 means all, when < 0 means older
    c.updateStream = function(when, option){
        if (updating) return;
        updating = true;
        var d = callStreamAPI(when, option);
        d.done(function(d,hasmore){
            var o = U.render('stream_item', d, {
                getDate: c.getReadableDate,
            });
            o.done(function(t){
                if (hasmore){
                    t.last().attr('data-hasmore', 'true');
                } else {
                    $(document).unbind('scroll');
                }
                updating = false;
            });
            if (!when) $('ol.timeline').html('');
            if (when > 0) o.prependTo('ol.timeline');
            else o.appendTo('ol.timeline');
        });
        return d;
    };

    c.start = function(){
        $('ol.timeline a.delete').live('click', function(){
            var item = $(this).parents('ol.timeline>li.item');
            var msgid = $(item).find('div.content').attr('data-id');
            T.remove({msg_id: msgid}).success(function(r){
                if (r.success) {
                    item.remove();
                    U.success(_('delete succeeded'), 1000);
                } else {
                    U.error(_('delete failed'), 1500);
                }
            });
            return false;
        });
        $('ol.timeline a.forward').live('click', function(){
            var item = $(this).parents('ol.timeline>li.item');
            var msg = $(item).find('div.content');
            var msgid = msg.attr('data-id');
            console.log(msg);
            T.publish({
                content: '',
                parent: msgid,
                type: 'forward'
            }).success(function(r){
                if (r.success) {
                    U.success(_('forward succeed'), 1000);
                    c.updateStream(1);
                } else {
                    U.error(_('forward failed'), 1500);
                }
            });
            return false;
        });
    };

    c.end = function(){
        $('ol.timeline a.delete').die('click');
    };

})('POST_STREAM', jQuery);

