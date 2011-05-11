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
    };

    var response_handler = function(d) {
        this.has_more = d.has_more;
        this.skip += d.items.length;
        U.render('userstream_item', d.items).appendTo(this.list).done(function(t) {
            U.FollowButton(t.find('.follow-button'));
        });
    };

    UserStream.prototype.load_more = function() {
        if (!this.has_more)
            return $.Deferred().resolve(false);

        var req;
        if (this.type === 'follower') {
            req = T.get_follower({
                uid: this.uid,
                skip: this.skip
            });
        } else if (this.type === 'following') {
            req = T.get_following({
                uid: this.uid,
                skip: this.skip
            });
        }

        return req.success($.proxy(response_handler, this))
    }

    this.U = this.U || {};
    this.U[name] = UserStream;
})(jQuery, 'UserStream');
