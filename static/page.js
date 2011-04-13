/**
 *  For page.html
 */
var U=U||{},C=C||{};

(function(name){
    var u=U[name]={};
    var c=C[name]={};

    c.goDefault=function(){
        T.current_user().success(function(d){
            if (d.error) {  // not logged in
                U.render('public').fillTo('#main').done(function(){
                    if(C&&C.PUBLIC)C.PUBLIC.start();
                });
            } else {
                U.render('home').fillTo('#main').done(function(){
                    if(C&&C.HOME)C.HOME.start();
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
})("PAGE");

R.path('notfound',function(){U.render('notfound').fillTo('#main');})
R.path('default',C.PAGE.goDefault);
