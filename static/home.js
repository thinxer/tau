// for page home.html

var K=K||{};
var C=C||{};

(function(name){
	var c=C[name]={};
	c.start=function(){
		c.setupClick();
	};
	c.setupClick=function(){
		jQuery('button#logoutBtn').click(function(){
			T.logout().then(function(){
				if(window.location.hash=="#public")window.location.reload(true);
				else window.location="/#public";
			});
		});
	};
})('HOME');

