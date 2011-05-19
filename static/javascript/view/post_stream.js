// for stream_item, used by home page, profile page

(function(name, $){
    var C = window.C = window.C || {}, U = window.U = window.U || {};
    var c = C[name] = {}, u = U[name] = {};

    var PostStream = function(target, api_option, class_option) {
        this.box = $('<div/>').addClass('timeline-box');
        var newer_banner = $('<div/>').addClass('newer-banner');
        var banner_text = $('<span/>').addClass('banner-text');
        banner_text.text(_('new tweet'));
        newer_banner.html(banner_text);
        newer_banner.prependTo(this.box);

        this.random_mark = Math.random();

        this.list = $('<ul/>').addClass('timeline');
        this.list.data('mark', this.random_mark);
        this.list.appendTo(this.box);
        $(target).html(this.box);

        this.updating = false;
        this.api_option = api_option;
        this.container_selector = '.timeline-box';
        this.selector = target + ' ul.timeline';
        this.started = false;
        this.newer_buffer = [];

        this.data = {};
        this.users = {};

        var defaults = {
            auto_fresh: true,
            api: 'stream'
        };

        $.extend(this, defaults, class_option);

        this.hasmore = true;    // only for older, not for newer
        this.start();
        this.updated_before = false;
    };

    PostStream.prototype.showBanner = function(who, display) {
        if (arguments.length < 2) display = 'block';
        this.box.find('.' + who + '-banner').css('display', display);
    }

    PostStream.prototype.flush = function(who) {
        var this_ref = this;
        if (who == 'newer') {
            U.render('stream_item', this.newer_buffer).prependTo(this.list).done(function() {
                this_ref.newer_buffer = [];
            });
            this.showBanner('newer', 'none');
        }
    }

    /**
     * Update stream according to time and condition
     *
     * @param {string} when , can be 'newer', 'older' or leave empty
     * @param {boolean} imm, update immediately or just show a banner to let the user know
     *                       there are newer post
     */
    PostStream.prototype.update = function(when, imm) {
        this.updated_before = true;
        if (this.updating) {
            return;
        }
        this.updating = true;
        var deferred = $.Deferred();
        var this_ref = this;
        var p = this.api_option || {};
        if (arguments.length < 2) {
            imm = true;
        }
        if (this.list.children().length) {
            if (when == 'newer') {
                p.newerThan = +this.list.find('li .timestamp').first().data('timestamp');
            } else if (when == 'older') {
                p.olderThan = +this.list.find('li .timestamp').last().data('timestamp');
            }
        }
        if (this.newer_buffer.length && when == 'newer') {
            if (p.newerThan) {
                if (this.newer_buffer[0].timestamp > p.newerThan) {
                    p.newerThan = this.newer_buffer[0].timestamp;
                } else {
                    this.newer_buffer = [];
                }
            } else {
                p.newerThan = this.newer_buffer[0].timestamp;
            }
        }
        if (when == 'older' && !this.hasmore) {
            deferred.resolve(false);
        } else {
            T[this.api](p).success(function(r){
                var data = [];
                $.extend(this_ref.users, r.users);
                if (when == 'older') {
                    this_ref.hasmore = r.has_more;
                }

                $(r.items).each(function(i, e){
                    var o = {};
                    o[e.id] = e;
                    $.extend(this_ref.data, o);

                    var isCurUser = T.checkLogin() == e.uid;
                    if (e.type == 'forward' && !e.parent_message) {
                        return;
                    }
                    o = {
                        content: e.type == 'normal' || e.type == 'reply' ? 
                                 H.formatEntities(e.content, e.entities) : 
                                 H.formatEntities(e.parent_message.content, e.parent_message.entities),
                        showDelete: isCurUser,
                        showForward: !isCurUser,
                        showReply: !isCurUser,
                        type: e.type,
                        id: e.id,
                        uid: e.uid,
                        creator: e.type == 'normal' || e.type == 'reply' ? 
                                 e.uid : 
                                 e.parent_message.uid,
                        timestamp: e.timestamp,
                        photo: e.type == 'normal' || e.type == 'reply' ? 
                               this_ref.users[e.uid].photo : 
                               this_ref.users[e.parent_message.uid].photo
                    };
                    data.push(o);
                });
                if (imm) {
                    var o = U.render('stream_item', data);
                    if (when == 'newer') {
                        this_ref.flush('newer');
                        o.prependTo(this_ref.list);
                    } else if (when == 'older'){
                        o.appendTo(this_ref.list);
                    } else {
                        o.fillTo(this_ref.list);
                    }
                    o.done(function(t) {
                        if (r.has_more) {
                            t.last().addClass('has-more');
                        }
                    });
                    o.then(function() {
                        deferred.resolve(this_ref.hasmore);
                    });
                } else {
                    if (when == 'newer') {
                        this_ref.newer_buffer = $.merge(data, this_ref.newer_buffer);
                        if (this_ref.newer_buffer.length > 0) {
                            this_ref.showBanner('newer');
                        }
                    } else if (when == 'older') {
                        //$.merge(this_ref.older_buffer, data); // older buffer currently not used
                    }
                    deferred.resolve(this_ref.hasmore);
                }
            }).error(function() {
                deferred.resolve(false);
            });
        }
        deferred.then(function() {
            this_ref.updating = false;
        });
        return deferred;
    };

    PostStream.prototype.autofresh = function() {
        var that = this;
        if (this.random_mark == $(this.selector).data('mark')) {
            if (this.updated_before) {
                this.update('newer', false).then(function() {
                    setTimeout($.proxy(that.autofresh, that), 10000);
                });
            } else {
                setTimeout($.proxy(this.autofresh, this), 10000);
            }
        }
    };

    PostStream.prototype.start = function() {
        if (this.started) return;
        var this_ref = this;
        $('a.delete', $(this.selector)).live('click', function(e) {
            e.preventDefault();
            var item = $(this).parents('li.item');
            var msgid = $(item).data('id');
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
            var msgid = item.data('id');
            var data_item = this_ref.data[msgid];
            var content = data_item.content;
            if (data_item.type == 'forward') {
                content = data_item.parent_message.content;
                msgid = data_item.parent_message.id;
            }
            U.confirm_dialog(_('Are you sure you want to forward this post?'), content).done(function(button){
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
            var msgid = item.data('id');
            var uid = this_ref.data[msgid].uid;
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
        $('.newer-banner', $(this.container_selector)).click(function(r) {
            this_ref.flush('newer');
        });
        if (this.auto_fresh) {
            setTimeout($.proxy(this.autofresh, this), 10000);
        }
        this.started = true;
    };

    PostStream.prototype.end = function(){
        $('a.delete', $(this.selector)).die('click');
        $('a.forward', $(this.selector)).die('click');
        $('a.reply', $(this.selector)).die('click');
    };

    U[name] = PostStream;

})('PostStream', jQuery);

