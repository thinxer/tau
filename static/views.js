/**
 * Views for Tau.
 * Depends on Tau, Ui, Controller.
 */
(function() {
    var renderPublic = function() {
        U.render('public').fillTo('#main');
    };

    var renderHome = function() {
        U.render('home').fillTo('#main');
    };

    // default handler
    C.path('default', function() {
        T.current_user().success(function(d) {
            if (d.error) {  // not logged in
                renderPublic();
            } else {
                renderHome();
            }
        });
    });

    // notfound handler
    C.path('notfound', function() {
        U.render('notfound').fillTo('#main');
    });

    // debug handler
    C.path('debug', function() {
        U.render('debug').fillTo('#main');
    });

})();
