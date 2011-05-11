// for search page

(function(name, $) {
    
    var handler = {};
    var stream;

    handler.search_home = function() {

    };

    handler.search_stream = function(query) {
        stream = new U.SearchStream('.search_wrapper', {
            query: query
        });
    };

    handler.search_people = function() {

    };

    var start = function() {
        $('#search .searchbox button').click(function() {
            var q = $('#search .searchbox input').val();
            R.path('search/search_stream/'+q);
        });
    };

    R.path('search', {
        loadDeferred: null,
        enter: function() {
            U.PAGE.header.show();
            if (!T.checkLogin()) {
                R.path('public');
            } else {
                this.loadDeferred = $.Deferred();
                U.render('search').fillTo('#main')
                                  .done(this.loadDeferred.resolve)
                                  .done(start);
            }
        },
        change: function(path, oldPath, level) {
            this.loadDeferred.done(function() {
                var p = path[1] || 'search_home';
                var q = path[2];
                handler[p](q);
            });
        },
        leave: function() {

        }
    });

})('SEARCH', jQuery);
