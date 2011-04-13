// for home.html

var K=K||{},C=C||{},U=U||{};

(function(name){
    R.path('home',C.PAGE.goDefault);
	var c=C[name]={};
    var u=U[name]={};

	c.start=function(){
		c.setupClick();
	};
	c.setupClick=function(){
		jQuery('button#logoutBtn').click(function(){
			T.logout().then(function(){
				if(window.location.hash!="#public")R.path('public');
				else window.location.reload(true);
			});
		});
	};
})('HOME');

