/**
 *  For page.html
 */

(function(name){
    var U=window.U=window.U||{},C=window.C=window.C||{};
    var u=U[name]={};
    var c=C[name]={};

    c.goDefault=function(){
        T.current_user().success(function(d){
            if (d.error) {  // not logged in
                U.render('public').fillTo('#main').done(function(){
                    if(C&&C.PUBLIC)C.PUBLIC.start(d);
                });
            } else {
                U.render('home',d).fillTo('#main').done(function(){
                    if(C&&C.HOME)C.HOME.start(d);
                });
            }
        });
    };

    u.statusDiv={
        id:'div#statusDiv',
        show:function(s,callback){
            if(s)jQuery(u.statusDiv.id).text(s);
            jQuery(u.statusDiv.id).slideDown('fast',callback);
        },
        hide:function(){
            jQuery(u.statusDiv.id).slideUp('fast',function(){
				jQuery(u.statusDiv.id).text('');
			});
        },
		showHide:function(s,intv){
			this.show(s,function(){
				setTimeout(u.statusDiv.hide,intv||2000);
			});
		}
    }

    R.path('notfound',function(){U.render('notfound').fillTo('#main');})
    R.path('default',C.PAGE.goDefault);
    R.path('logout', function() {
        T.logout().then(function() {
            R.path('');
        });
    });
})("PAGE");

