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
				window.location="/#public";
			});
		});
	};
})('HOME');

