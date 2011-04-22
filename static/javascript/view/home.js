// for home.html

(function(name){
	var K=window.K=window.K||{},C=window.C=window.C||{};
	var c=C[name]={},u=U[name]={};

	c.start=function(curuser){
		c.setupCuruser(curuser);
		c.setupClick();
		c.updateStream(0);
	};
	c.setupCuruser=function(d){
		console.log(d);
		$('li#postBox>div>a.avatar>img').attr('src',d.photo);
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
				o.val('');
				U.PAGE.statusDiv.show('发布成功！');
				c.updateStream(1);
			}).error(function(){
			});
		};
		jQuery('a#pubBtn').click(publish);
		jQuery('#publisher').keypress(function(e){
			if(e.ctrlKey && (e.keyCode==13 || e.keyCode==10)){
				publish();
			}
		});
	};
	c.callStreamAPI=function(callback,when){		// when > 0 means newer, when =0 means all, when < 0 means older
		var p={};
		if(when>0){
			p.newerThan=+$('#postBox + li > div[timestamp]').attr('timestamp');
		}else if(when<0){
			p.olderThan=+$('ol#posts>li:last-child>div[timestamp]').attr('timestamp');
		}
		T.stream(p).success(function(r){
			jQuery(r.items).each(function(i,e){
				e['user']=r.users[e.uid];
			});
			callback(r.items,r.has_more);
		});
	};
	c.updateStream=function(when){		// when > 0 means newer, when =0 means all, when < 0 means older
		c.callStreamAPI(function(d,hasmore){
			var o=U.render('stream_item',d,{
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
			});
			if(!when) $('ol#posts>:not(li#postBox)').remove();
			if(when>0) o.insertAfter('li#postBox');
			else o.appendTo('ol#posts');
		},when);
	};

	R.path('home',C.PAGE.goDefault);

})('HOME');

