(function(name, $) {

    var SearchStream = function(target, option) {
        var defaults = { };
        $.extend(this, defaults, option);

        this.has_more = true;

        this.list = $('<ul/>').addClass('searchstream').addClass('timeline');
        $(target).html(this.list);

        this.data = {};
        this.users = {};
    };

    var response_handler = function(r) {
        var that = this;
        this.has_more = r.has_more;
        var data = [];
        $.extend(this.users, r.users);
        $(r.items).each(function(i, e) {
            var o = {};
            o[e.id] = e;
            $.extend(that.data, o);

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
                       that.users[e.uid].photo : 
                       that.users[e.parent_message.uid].photo
            };
            data.push(o);
        });
        U.render('stream_item', data).appendTo(this.list);
    };

    SearchStream.prototype.load_more = function() {
        if (!this.has_more) $.Deferred().resolve(false);

        return T.search({
            query: this.query
        }).success($.proxy(response_handler, this));
    };

    this.U = this.U || {};
    this.U[name] = SearchStream;
})('SearchStream', jQuery);
