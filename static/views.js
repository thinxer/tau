/**
 * Views for Tau.
 * Depends on Tau, Ui, Controller.
 */
(function() {

    // Default handler
    C.path('default', function() {
        if (T.checkLogin()) {
            C.setHash('home');
        } else {
            C.setHash('public');
        }
    });

    // Home handler
    C.path('home', function() {
        U.render('home').fillTo('#main');
    });

    // Public home handler
    C.path('public', function() {
        U.render('public').fillTo('#main');
    });

})();
