// for page public.html


(function(name){
    var K=window.K=window.K||{};	// constant
    var C=window.C=window.C||{};	// controller

    K.PUBLIC={
        UID_TOO_SHORT:"用户名太短啦，你能长点吗？",
        PASS_TOO_SHORT:"密码太短了，长点OK？",
        NOT_EMAIL:"你输入的邮箱地址是个邮箱？不像吧?",
        SERVER_ERR:"这个，我们服务器的核能电池没电了，等我们充好电再来光临吧～",
        INVALID_UID:"您的用户ID可能已经被使用了，试试换一个其他的吧"
    };

    R.path('public',C.PAGE.goDefault);
	var c=C[name]={};
	c.start=function(){
		c.setupClick();
		c.setPlaceHolder();
	};
	c.setupClick=function(){
		var o=jQuery('button#regbtn');
		o.click(function(){
			var u=jQuery('#uid').val(),p=jQuery('#password').val(),m=jQuery('#email').val();
			if(o.attr('mark')=="reg"){
				if(!c.checkRegister(u,p,m))return;
				T.register({uid:u,email:m,password:p}).success(function(resp,state,o){
					if(resp['success']==1){
						c.showError("");
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
			}else{
				if(!c.checkLogin(u,p))return;
				c.showError("");
				c.login(u,p);
			}
		});
		$('a#toggle').click(function(){
			if(c.flag)return;
			c.flag=true;
			if(o.attr('mark')=='login'){
				o.attr('mark','reg');
				o.children().text('注册');
				c.toggleTip('已有帐号，直接登录');
				$('a#forgetPass').animate({opacity:0},200);
				$('div#inputWrapper').animate({left:'-=76'},600);
				$('button#regbtn').animate({
					left:'+=167'
				},600,function(){
					$('div#emailDiv').animate({opacity:1},200,function(){
						c.flag=false;
					});
				});
			}else{
				o.attr('mark','login');
				o.children().text('登录');
				c.toggleTip('没有帐号？注册一个吧');
				$('a#forgetPass').animate({opacity:1},800);
				$('div#emailDiv').animate({opacity:0},200);
				$('div#inputWrapper').animate({left:'+=76'},600);
				$('button#regbtn').animate({
					left:'-=167'
				},600,function(){
					c.flag=false;
				});
			}
		});
	};
	c.setPlaceHolder=function(){
		var o=jQuery('.reginput');
		o.focus(function(){
			jQuery(this).siblings().css('opacity',0);
		});
		o.blur(function(){
			if(jQuery(this).val().length==0) jQuery(this).siblings().css('opacity',1);
		});
	};
	c.toggleTip=function(s){
		if(!s)return;
		$('a#toggle').animate({opacity:0},200,function(){
			$('a#toggle').text(s);
			$('a#toggle').animate({opacity:1},200);
		});
	};
	c.checkRegister=function(u,p,m){
		if(!this.checkLogin(u,p))return false;
		if(!/.+@.+\..+/i.test(m)){
			this.showError(K.PUBLIC.NOT_EMAIL);
			return false;
		}
		return true;
	};
	c.checkLogin=function(u,p){
		if(u.length<2){
			this.showError(K.PUBLIC.UID_TOO_SHORT);
			return false;
		}
		if(p.length<2){
			this.showError(K.PUBLIC.PASS_TOO_SHORT);
			return false;
		}
		return true;
	},
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

