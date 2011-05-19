// for search page

(function(name, $) {

    var stream, button, query;

    var attachEvent = function() {
        $('#search form.searchbox').submit(function(e) {
            e.preventDefault();
            var q = $('#search .searchbox input').val();
            if (!q.length) {
                return;
            }
            R.path(['search', q]);
        });
    };

    var setupStream = function() {
        stream = new U.PostStream('div.stream_wrapper', {
            query: query
        }, {
            api: 'search'
        });

        button = new U.AutoLoadButton(
            'div.stream_wrapper',
            function() {
                return stream.update('older');
            }
        );
    };

    R.path('search', {
        loadDeferred: null,
        enter: function() {
            if (!T.checkLogin()) {
                R.path('public');
                return false;
            } else {
                U.PAGE.header.show();
                this.loadDeferred = $.Deferred();
                U.render('search').fillTo('#main')
                                  .done(attachEvent)
                                  .done(this.loadDeferred.resolve)
            }
        },
        change: function(path, oldPath, level) {
            this.loadDeferred.done(function() {
                query = path[1];
                if (!query) {
                    // TODO: show search home
                } else {
                    $('#search .searchbox input').val(query)
                    setupStream();
                    button.active(true);
                }
            });
        },
        leave: function() {

        }
    });

})('SEARCH', jQuery);
