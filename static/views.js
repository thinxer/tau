/**
 * Views for Tau.
 * Depends on Tau, Ui, Controller.
 */
(function() {

    // Default handler
    C.path('default', function() {
        // TODO Find a way to determine whether the user has logged in.
        C.setHash('home');
    });

    // notfound handler
    C.path('notfound', function() {
        U.render('notfound').fillTo('#main');
    });

    // Home handler
    C.path('home', function() {
        U.render('home').fillTo('#main');
    });

    // Public home handler
    C.path('public', function() {
        U.render('public').fillTo('#main');
    });

    // Debug handler
    C.path('debug', function() {
        U.render('debug').fillTo('#main');
    });

})();
