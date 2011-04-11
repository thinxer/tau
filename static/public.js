// for page public.html

var ctrl=ctrl||{};

ctrl.start=function(){
	ctrl.setupClick();
};

ctrl.setupClick=function(){
	jQuery('#submit').click(function(){
		var s='({uid:"'+jQuery('#uid').val()+'",email:"'+jQuery('#email').val()+'",password:"'+jQuery('#password').val()+'"})';
		T['register'](eval(s)).success(function(){
			for(var i in arguments){
				alert(i);
			}
		});
	});
};

jQuery(function(){
	ctrl.start();
});

