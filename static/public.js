// for page public.html

var K=K||{};	// constant
var C=C||{};	// controller

K.PUBLIC={
	UID_TOO_SHORT:"用户名太短啦，你能长点吗？",
	PASS_TOO_SHORT:"密码太短了，长点OK？",
	NOT_EMAIL:"你输入的邮箱地址是个邮箱？不像吧?",
	SERVER_ERR:"这个，我们服务器的核能电池没电了，等我们充好电再来光临吧～",
	INVALID_UID:"您的用户ID可能已经被使用了，试试换一个其他的吧"
};

(function(name){
    R.path('public',C.PAGE.goDefault);
	var c=C[name]={};
	c.start=function(){
		c.setupClick();
	};
	c.setupClick=function(){
		jQuery('button#submit').click(function(){
			var u=jQuery('#uid').val(),p=jQuery('#password').val(),m=jQuery('#email').val();
			if(!c.checkRegister(u,p,m)){
				return;
			}
			T.register({uid:u,email:m,password:p}).success(function(resp,state,o){
				if(resp['success']==1){
					c.login(u,p);
				}else if((typeof resp.error)!='undefined'){
					if(resp.error==-4){
						c.showError(K.PUBLIC.INVALID_UID);
					}else{
						console.log('server resp received,but,firetruck,error !');
						console.log(resp);
					}
				}
			}).error(function(){
				console.log('server too far away to reach, I believe it\'s 500, server internel error');
				c.showError(K.PUBLIC.SERVER_ERR);
			});
		});
		jQuery('button#login').click(function(){
			var u=jQuery('#uid').val(),p=jQuery('#password').val();
			c.login(u,p);
		});
	};
	c.checkRegister=function(u,p,m){
		if(u.length<2){
			this.showError(K.PUBLIC.UID_TOO_SHORT);
			return false;
		}
		if(p.length<2){
			this.showError(K.PUBLIC.PASS_TOO_SHORT);
			return false;
		}
		if(!/.+@.+\..+/i.test(m)){
			this.showError(K.PUBLIC.NOT_EMAIL);
			return false;
		}
		return true;
	};
	c.showError=function(s){
		if(U&&U.PAGE.statusDiv){
			U.PAGE.statusDiv.show(s);
		}else{
			console.log(U);
		}
	},
	c.login=function(u,p){
		T.login({uid:u,password:p}).success(function(r,s,o){
			if(window.location.hash!="#home")R.path('home');
			else R.reload();
		}).error(function(){
			c.showError(K.PUBLIC.SERVER_ERR);
		});
	}
})('PUBLIC');

