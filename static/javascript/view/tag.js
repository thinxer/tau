// for hash tag click

(function(name, $) {

    R.path('tag', {
        enter: function() {
            if (!T.checkLogin()) {
                R.path('public');
                return false;
            }
        },
        change: function(path, oldPath, level) {
            var p = path.slice();
            p[0] = 'search';
            R.path(p);
        }
    });

})('TAG', jQuery);

