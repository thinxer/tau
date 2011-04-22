// for home.html

(function(name){
    var K=window.K=window.K||{},C=window.C=window.C||{};
    R.path('home',C.PAGE.goDefault);

	var c=C[name]={};
    var u=U[name]={};
	var markup=' <li class="post rr10"> <div style="position:absolute;left:0px;top:0px;"> <span class="larrow"></span> <a href="" class="avatar" ><img class="rr6" src="${user.photo}" style="width:64px;height:64px;"/></a> </div> <div> <a href="#" style="color:green;">${uid}</a>: </div> <div> ${content} </div> <div style="position:absolute;bottom:4px;"> ${$item.getDate(timestamp)} </div> </li> ';
	jQuery.template('post',markup);

	c.start=function(){
		c.setupClick();
		c.updateCurUser();
		c.updateTimeline();
	};
	c.setupClick=function(){
		jQuery('#logout').click(function(){
			T.logout().then(function(){
				if(window.location.hash!="#public")R.path('public');
				else R.reload();
			});
		});
		var publish=function(){
			var o=$('textarea#publisher'),v=o.val();
			if(!v.length){
				// show error ?
				return;
			}
			T.publish({content:v}).success(function(){
				o.text('');
				U.PAGE.statusDiv.show('发布成功！');
			}).error(function(){
			});
		};
		jQuery('a#pubBtn').click(publish);
		jQuery('#publisher').keypress(function(e){
			if(e.which==10){
				publish();
			}
		});
	};
	c.updateTimeline=function(){
		var r=T.stream({}).success(function(r,s,o){
			console.log(r.items);
			jQuery(r.items).each(function(i,e){
				e['user']=r.users[e.uid];
			});
			jQuery.tmpl('post',r.items,{
				getDate:function(m){
					var d=new Date(m),now=jQuery.now(),delta=now-d;
					if(delta<3600000){
						return Math.round(delta/60000)+'分钟前';
					}else if(delta<86400000){
						return Math.round(delta/3600000)+'小时前';
					}else if(delta<259200000){		//three days
						return Math.round(delta/86400000)+'天前';
					}
					return new Date(m).toLocaleDateString();
				}
			}).appendTo('ol#posts');
		});
	};
	c.updateCurUser=function(){
		T.current_user({}).success(function(r){
			
		}).error(function(){
		
		});
	};

})('HOME');

