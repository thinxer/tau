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
                U.render('home').fillTo('#main').done(function(){
                    if(C&&C.HOME)C.HOME.start(d);
                });
            }
        });
    };

    u.statusDiv={
        id:'div#statusDiv',
        show:function(){
            if(arguments.length>0)jQuery(this.id).text(''+arguments[0]);
            jQuery(this.id).slideDown('fast');
        },
        hide:function(){
            jQuery(this.id).text('');
            jQuery(this.id).slideUp('fast');
        }
    }

    R.path('notfound',function(){U.render('notfound').fillTo('#main');})
    R.path('default',C.PAGE.goDefault);
})("PAGE");

