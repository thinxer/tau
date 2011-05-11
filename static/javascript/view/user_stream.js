(function($, name) {

    var UserStream = function(target, option) {
        var defaults  = {
            'type': 'following',
            // default to current user id
            'uid': T.checkLogin(),
            'skip': 0
        };
        $.extend(this, defaults, option);

        this.has_more = true;

        this.list = $('<ul/>').addClass('userstream');
        $(target).html(this.list);

        this.load_more();

    };

    var response_handler = function(d) {
        this.has_more = d.has_more;
        this.skip += d.items.length;
        U.render('userstream_item', d.items).appendTo(this.list);
    };

    UserStream.prototype.load_more = function() {
        if (!this.has_more) return false;

        if (this.type === 'follower') {
            T.get_follower({
                uid: this.uid,
                skip: this.skip
            }).success($.proxy(response_handler, this));
        } else if (this.type === 'following') {
            T.get_following({
                uid: this.uid,
                skip: this.skip
            }).success($.proxy(response_handler, this));
        }

        return true;
    }

    UserStream.prototype.onScroll = function(dir) {
        if (!dir) dir = 'bottom';
        if (dir == 'bottom') {
            this.load_more();
        }
    };

    this.U = this.U || {};
    this.U[name] = UserStream;
})(jQuery, 'UserStream');
