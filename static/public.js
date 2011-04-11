// for page public.html

var ctrl=ctrl||{};

ctrl.start=function(){
	ctrl.setupClick();
};

ctrl.setupClick=function(){
	jQuery('#submit').click(function(){
		var u=jQuery('#uid').val(),m=jQuery('#email').val(),p=jQuery('#password').val();
		var d=T['register'](kv2obj('uid',u,'email',m,'password',p));
		d.success(function(resp,state,o){
			if(resp['success']==1){
				T.login(kv2obj('uid',u,'password',p)).success(function(){
					window.location.reload(true);
				});
			}else if(resp['error']<0){
				console.log('firetruck, error !');
			}
			console.log(arguments);
		});
		d.error(function(){
		
		});
	});
};

// start the world when DOM ready
jQuery(function(){
	ctrl.start();
});

