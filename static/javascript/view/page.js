/**
 *  For page.html
 */

(function(name){
    var U=window.U=window.U||{},C=window.C=window.C||{};
    var u=U[name]={};
    var c=C[name]={};

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

    u.header = {
        show: function() {
            jQuery('#header').animate({opacity: 1});
        },
        hide: function() {
            jQuery('#header').animate({opacity: 0});
        }
    };

    // Prevent hash anchors from scrolling the page.
    jQuery('a[href^=\\#]').click(function(e) {
        e.preventDefault();
        // Set path through our router.
        R.path(jQuery(this).attr('href').substring(1));
    });

    R.path('notfound',function(){U.render('notfound').fillTo('#main');})
    R.path('default', function() {
        if (T.checkLogin()) {
            R.path('home');
        } else {
            R.path('public');
        }
    });
    R.path('logout', function() {
        T.logout().then(function() {
            R.path('');
        });
    });
})("PAGE");

