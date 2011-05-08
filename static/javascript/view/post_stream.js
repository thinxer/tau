// for stream_iteam, used by home page, profile page

(function(name, $){
    var C = window.C = window.C || {}, U = window.U = window.U || {};
    var c = C[name] = {}, u = U[name] = {};

    var PostStream = function(target, api_option, class_option) {
        this.list = $('<ol/>').addClass('timeline');
        $(target).html(this.list);
        this.newer_banner = $('<div/>').addClass('newer-banner');
        this.newer_banner.prependTo(this.list);
        this.updating = false;
        this.api_option = api_option;
        this.selector = 'ol.timeline';
        this.started = false;
        this.newer_buffer = [];
        this.older_buffer = [];

        var defaults = {
            scroll_margin: 20,
            listen_scroll: true
        };

        $.extend(this, defaults, class_option);

        this.update();
    };

    /**
     * Update stream according to time and condition
     *
     * @param {string} when , can be 'newer', 'older' or leave empty
     * @param {boolean} imm, update immediately or just show a banner to let the user know
     *                       there are newer post
     */
    PostStream.prototype.update = function(when, imm){
        if (this.updating) return;
        this.updating = true;
        var this_ref = this;
        var p = this.api_option || {};
        if (arguments.length < 2) {
            imm = true;
        }
        if (this.list.children().length) {
            if (when == 'newer'){
                p.newerThan = +this.list.find('li .timestamp').first().attr('data-timestamp');
            } else if (when == 'older') {
                p.olderThan = +this.list.find('li .timestamp').last().attr('data-timestamp');
            }
        }
        if (when == 'older' && !this.list.children().last().hasClass('has-more')) {
            this.updating = false;
            return;
        }
        return T.stream(p).success(function(r){
            var data = [];
            $(r.items).each(function(i, e){
                e.content = H.formatEntities(e.content, e.entities);
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
                    data.push($.extend(e, {
                        user: r.users[e.uid]
                    }));
                }
            });
            if (imm) {
                var o = U.render('stream_item', data);
                if (!when) this_ref.list.children('li.item').remove();
                if (when == 'newer') o.prependTo(this_ref.list);
                else o.appendTo(this_ref.list);
                o.done(function(t) {
                    if (r.has_more) {
                        t.last().addClass('has-more');
                    }
                });
            } else {
                if (when == 'newer') $.merge(this_ref.newer_buffer, data);
                else if (when == 'older') {
                    $.merge(this_ref.older_buffer, data);
                }
            }
            o.then(function(){
                this_ref.updating = false;
            });
        }).error(function(r) {
            this_ref.updating = false;
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
        $('a.delete', $(this.selector)).live('click', function(e) {
            e.preventDefault();
            var item = $(this).parents('li.item');
            var msgid = $(item).find('div.content').attr('data-id');
            U.confirm_dialog(_('Are you sure you want to delete?')).done(function(button){
                if (button !== 'confirm') return;
                T.remove({msg_id: msgid}).success(function(r){
                    if (r.success) {
                        item.remove();
                        U.success(_('delete succeeded'), 2000);
                    } else {
                        U.error(_('delete failed'));
                    }
                });
            });
        });
        $('a.forward', $(this.selector)).live('click', function(e) {
            e.preventDefault();
            var item = $(this).parents('li.item');
            var msg = $(item).find('div.content');
            var msgid = msg.attr('data-id');
            U.confirm_dialog(_('Are you sure you want to forward this post?')).done(function(button){
                if (button !== 'confirm') return;
                T.publish({
                    content: '',
                    parent: msgid,
                    type: 'forward'
                }).success(function(r){
                    if (r.success) {
                        U.success(_('forward succeed'), 1000);
                        this_ref.update('newer');
                    } else {
                        U.error(_('forward failed'));
                    }
                }).error(function() {
                    U.error(_('forward failed'));
                });
            });
        });
        $('a.reply', $(this.selector)).live('click', function(e) {
            e.preventDefault();
            var item = $(this).parents('li.item');
            var msgid = item.find('div.content').attr('data-id');
            var uid = item.find('.uid').text();
            var dialog = U.compose_dialog(_('add reply'), '@' + uid + ' ');
            dialog.done(function(button) {
                if (button === 'publish') {
                    T.publish({
                        content: dialog.val,
                        parent: msgid,
                        type: 'reply'
                    }).success(function(r) {
                        if (r.success) {
                            U.success(_('reply succeed'));
                            this_ref.update('newer');
                        } else {
                            U.error(_('reply failed'));
                        }
                    }).error(function() {
                        U.error(_('reply failed'));
                    });
                }
            });
        });
        if (this.listen_scroll) {
            $(window).scroll($.proxy(this.handle_scroll, this));
        }
        this.started = true;
    };

    PostStream.prototype.end = function(){
        $('a.delete', $(this.selector)).die('click');
        $('a.forward', $(this.selector)).die('click');
        $('a.reply', $(this.selector)).die('click');
        $(window).unbind('scroll', $.proxy(this.handle_scroll, this));
    };

    U[name] = PostStream;

})('PostStream', jQuery);

