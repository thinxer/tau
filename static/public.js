// for page public.html

var K=K||{};	// constant
var C=C||{};	// controller

K.PUBLIC={
	UID_TOO_SHORT:"用户名太短啦，你能长点吗？"
};

(function(name){
	var c=C[name]={};
	c.start=function(){
		c.setupClick();
	};
	c.setupClick=function(){
		jQuery('button#submit').click(function(){
			var u=jQuery('#uid').val(),p=jQuery('#password').val(),m=jQuery('#email').val();
			T.register({uid:u,email:m,password:p}).success(function(resp,state,o){
				if(resp['success']==1){
					T.login({uid:u,password:p}).success(function(){
						window.location='/';
					});
				}else if(resp['error']<0){
					console.log('firetruck, error !');
					console.log(resp);
				}
			}).error(function(){
				console.log('server too far away to reach');
			});
		});
	};
})('PUBLIC');

