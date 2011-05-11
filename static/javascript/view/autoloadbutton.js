(function(name, $) {

    var defaults = {
        // a function when load happens
        scrollBinded: false,
        nomoreText: _('no more'),
        hasmore: true,
        // load on first active
        firstload: true
    };

    /**
     * handler should return a deferred, which will resolve with has_more or an
     * object containing 'hasmore' property, or reject on fail.
     */
    var AutoLoadButton = function(target, handler, options) {
        var self = this;
        $.extend(self, defaults, options);
        self.handler = handler || null;
        self.loadDeferred = U.render('autoloadbutton').appendTo(target).done(function(t) {
            self.button = t;
            t.click($.proxy(self._loadmore, self));
        });
    };

    $.extend(AutoLoadButton.prototype, {
        active: function(value) {
            if (typeof(value) !== 'undefined') {
                if (value) {
                    this._bind();
                    if (this.firstload) {
                        this.firstload = false;
                        this.trigger();
                    }
                } else {
                    this._unbind();
                }
            }
            return this.scrollBinded;
        },
        trigger: function() {
            this.loadDeferred.done(function(button) {
                button.click();
            });
        },
        _bind: function() {
            if (this.scrollBinded) return false;
            $(window).bind('scroll', $.proxy(this._scroll, this));
            return this.scrollBinded = true;
        },
        _unbind: function() {
            if (!this.scrollBinded) return false;
            $(window).unbind('scroll', $.proxy(this._scroll, this));
            return this.scrollBinded = false;
        },
        _scroll: function() {
            var $w = $(window), $b = this.button;
            if (!$b) return;
            if ($w.height() + $w.scrollTop() >= $b.offset().top + $b.height()) {
                $b.click();
            }
        },
        _loadmore: function() {
            if (this.loading || !this.hasmore || !this.handler) return false;

            var d = this.handler();
                self = this,
                $st = self.button.find('.status'),
                $loading = self.button.find('.loading');

            if (!d || !('done' in d)) return;

            $st.text(_('loading'));
            $loading.show();
            self.loading = true;

            return d.done(function(hasmore) {
                self.hasmore = typeof(hasmore) === 'boolean' ? hasmore: hasmore.hasmore;
                $st.text(!!self.hasmore ? _('load more') : self.nomoreText);
                $loading.hide();
                self.loading = false;
                if (!self.hasmore) {
                    self.button.removeClass('hasmore').addClass('nomore');
                }
            }).fail(function() {
                $st.text(_('load failed, click to retry'));
                $loading.hide();
                self.loading = false;
                self.hasmore = true;
            });
        }
    });

    U[name] = AutoLoadButton;
})('AutoLoadButton', jQuery);
