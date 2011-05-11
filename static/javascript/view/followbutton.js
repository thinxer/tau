(function(name, $) {

    var FollowButton = function(target) {
        var $bs = $(target);
        $bs.each(function(i, b) {
            var $b = $(b);
            var uid = $b.data('uid');
            var isfollowing = $b.data('isfollowing');

            $b.mouseenter(function() {
                if (isfollowing) {
                    $b.text(_('remove from following'));
                } else {
                    $b.text(_('add to following'));
                }
            }).mouseleave(function() {
                if (isfollowing) {
                    $b.text(_('already following'));
                } else {
                    $b.text(_('add to following'));
                }
            }).mouseleave();

            var updateFollowing = function(value) {
                isfollowing = value;
                if (isfollowing) {
                    $b.removeClass('notfollowing');
                    $b.addClass('following');
                } else {
                    $b.addClass('notfollowing');
                    $b.removeClass('following');
                }
                $b.mouseleave();
            };

            updateFollowing(isfollowing);

            $b.click(function() {
                // XXX should we update all follow buttons all over the page?
                if (isfollowing) {
                    T.unfollow({uid:uid}).success(function(d) {
                        if (d.success) {
                            U.success(_('unfollow succeeded'));
                            updateFollowing(false);
                        }
                    });
                } else {
                    T.follow({uid:uid}).success(function(d) {
                        if (d.success) {
                            U.success(_('follow succeeded'));
                            updateFollowing(true);
                        }
                    });
                } // if
            }); // $b.click
        }); // each
    }; // FollowButton

    U[name] = FollowButton;
})('FollowButton', jQuery);
