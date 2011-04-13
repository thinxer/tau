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

	var goDefault=function() {
		T.current_user().success(function(d) {
			if (d.error) {  // not logged in
				renderPublic();
			} else {
				renderHome();
			}
		});
	};

    // default handler
	R.path('default',goDefault);
	R.path('home',goDefault);
	R.path('public',goDefault);

    // notfound handler
    R.path('notfound', function() {
        U.render('notfound').fillTo('#main');
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

// vim: set et ts=4 sw=4 tw=0 :
