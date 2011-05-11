(function(name, $) {

    var SearchStream = function(target, option) {
        var defaults = { };
        $.extend(this, defaults, option);

        this.has_more = true;

        this.list = $('<ul/>').addClass('searchstream').addClass('timeline');
        $(target).html(this.list);
        this.load_more();
    };

    var response_handler = function(r) {
        this.has_more = r.has_more;
        var data = [];
        $(r.items).each(function(i, e) {
            if (e.type == 'normal') {
                data.push($.extend(e, {
                    user: r.users[e.uid]
                }));
            } else if(e.type == 'forward') {
                if (e.parent_message) {
                    data.push($.extend(e, {
                        user: r.users[e.parent_message.uid],
                        content: e.parent_message.content
                    }));
                }
            } else if (e.type == 'reply') {
                data.push($.extend(e, {
                    user: r.users[e.uid]
                }));
            }
        });
        U.render('stream_item', data).appendTo(this.list);
    };

    SearchStream.prototype.load_more = function() {
        if (!this.has_more) return false;

        T.search({
            query: this.query
        }).success($.proxy(response_handler, this));
        return true;
    };

    this.U = this.U || {};
    this.U[name] = SearchStream;
})('SearchStream', jQuery);
