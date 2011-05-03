// for stream_iteam, used by home page, profile page

(function(name, $){
    var C = window.C = window.C || {}, U = window.U = window.U || {};
    var c = C[name] = {}, u = U[name] = {};

    var PostStream = function(target, option, listen_scroll, scroll_margin) {
        $.extend(this, option);
        this.list = $('<ol/>').addClass('timeline');
        $(target).html(this.list);
        this.updating = false;
        this.option = option;
        this.selector = 'ol.timeline';
        this.scroll_margin = scroll_margin == undefined ? 20 : scroll_margin;
        this.listen_scroll = listen_scroll == undefined ? true : listen_scroll;
        this.started = false;

        this.update();
    };

    var getReadableDate = function(m){
        var d = new Date(m), now = T.getServerTime(jQuery.now()), delta = now - d;
        if (delta < 30000) {
            return _('just now');
        } else if (delta < 3600000){
            return Math.round(delta/60000) + ' ' + _('minutes ago');
        } else if (delta < 86400000){
            return Math.round(delta/3600000) + ' ' + _('hours ago');
        } else if (delta < 259200000){      //three days
            return Math.round(delta/86400000) + ' ' + _('days ago');
        }
        return new Date(m).toLocaleDateString();
    };

    /**
     * Update stream according to time and condition
     *
     * @param {number} when , can be 'newer', 'older' or null
     * @param {object} option, options as filters passed to the api, e.g. {uid: 'some uid'}
     */
    PostStream.prototype.update = function(when){
        if (this.updating) return;
        this.updating = true;
        var this_ref = this;
        var p = this.option || {};
        if (this.list.children().length) {
            if (when == 'newer'){
                p.newerThan = +this.list.find('li .timestamp').first().attr('data-timestamp');
            } else if (when == 'older') {
                p.olderThan = +this.list.find('li .timestamp').last().attr('data-timestamp');
            }
        }
        if (when == 'older' && !this.list.children().last().hasClass('has-more')) {
            return;
        }
        return T.stream(p).success(function(r){
            var data = [];
            $(r.items).each(function(i, e){
                var isCurUser = T.checkLogin() == e.uid;
                e.showDelete = isCurUser;
                e.showForward = !isCurUser;
                e.showReply = !isCurUser;
                if (e.type == 'normal') {
                    data.push($.extend(e, {
                        user: r.users[e.uid]
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
            var o = U.render('stream_item', data, {
                getDate: getReadableDate
            });
            if (!when) this_ref.list.html('');
            if (when == 'newer') o.prependTo(this_ref.list);
            else o.appendTo(this_ref.list);
            o.done(function(t) {
                if (r.has_more) {
                    t.last().addClass('has-more');
                }
                this_ref.updating = false;
            });
        }).error(function(r) {
        });
    };

    PostStream.prototype.handle_scroll = function() {
        if ($(window).scrollTop() > this.list.height() + 
                                    this.list.position().top - 
                                    $(window).height() - this.scroll_margin) {
            this.update('older');
        }
    };

    PostStream.prototype.start = function(){
        if (this.started) return;
        var this_ref = this;
        $(this.selector + ' a.delete').live('click', function(){
            var item = $(this).parents('li.item');
            var msgid = $(item).find('div.content').attr('data-id');
            U.confirm_dialog(_('Are you sure you want to delete ?')).done(function(){
                T.remove({msg_id: msgid}).success(function(r){
                    if (r.success) {
                        item.remove();
                        U.success(_('delete succeeded'), 1000);
                    } else {
                        U.error(_('delete failed'), 1500);
                    }
                });
            });
            return false;
        });
        $(this.selector + ' a.forward').live('click', function(){
            var item = $(this).parents('li.item');
            var msg = $(item).find('div.content');
            var msgid = msg.attr('data-id');
            U.confirm_dialog(_('Are you sure you want to forward this post ?')).done(function(){
                T.publish({
                    content: '',
                    parent: msgid,
                    type: 'forward'
                }).success(function(r){
                    if (r.success) {
                        U.success(_('forward succeed'), 1000);
                        this_ref.update('newer');
                    } else {
                        U.error(_('forward failed'), 1500);
                    }
                }).error(function() {
                    U.error(_('forward failed'), 1500);
                });
            });
            return false;
        });
        if (this.listen_scroll) {
            $(document).scroll($.proxy(this.handle_scroll, this));
        }
        this.started = true;
    };

    PostStream.prototype.end = function(){
        $(this.selector + ' a.delete').die('click');
        $(this.selector + ' a.forward').die('click');
        $(document).unbind('scroll', this.handle_scroll);
    };

    U[name] = PostStream;

})('PostStream', jQuery);

