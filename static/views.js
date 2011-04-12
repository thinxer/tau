/**
 * Views for Tau.
 * Depends on Tau, Ui, Controller.
 */

 // setup path handlers
(function() {
    var renderPublic = function() {
        U.render('public').fillTo('#main').done(function(){
			if(C&&C.PUBLIC)C.PUBLIC.start();
		});
    };

    var renderHome = function() {
        U.render('home').fillTo('#main').done(function(){
			if(C&&C.HOME)C.HOME.start();
		});
    };

    // default handler
    R.path('default', function() {
        T.current_user().success(function(d) {
            if (d.error) {  // not logged in
                renderPublic();
            } else {
                renderHome();
            }
        });
    });

    // notfound handler
    R.path('notfound', function() {
        U.render('notfound').fillTo('#main');
    });

    // debug handler
    R.path('debug', function() {
        U.render('debug').fillTo('#main');
    });

})();

// View 
var V=V||(function(){
	var o={};
	o.statusDiv={
		id:'div#statusDiv',
		show:function(){
			if(arguments.length>0)jQuery(this.id).text(''+arguments[0]);
			jQuery(this.id).slideDown('fast');
		},
		hide:function(){
			jQuery(this.id).text('');
			jQuery(this.id).slideUp('fast');
		}
	};
	return o;
})();


