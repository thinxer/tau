// for home.html

(function(name){
    var K=window.K=window.K||{},C=window.C=window.C||{};
    R.path('home',C.PAGE.goDefault);
	var c=C[name]={};
    var u=U[name]={};

	c.start=function(){
		c.setupClick();
		c.updateTimeline();
	};
	c.setupClick=function(){
		jQuery('button#logoutBtn').click(function(){
			T.logout().then(function(){
				if(window.location.hash!="#public")R.path('public');
				else R.reload();
			});
		});
		jQuery('a#pubBtn').click(function(){
			var o=$('textarea#publisher');
			T.publish({content:o.val()}).success(function(){
				o.text('');
				U.PAGE.statusDiv.show('发布成功！');
			}).error(function(){
			});
		});
	};
	c.updateTimeline=function(){
		var r=T.stream({}).success(function(r,s,o){
			var t='';
			for(var i in r){
				t+='<li class="post rr10"><div>'+r[i].content+'</div></li>';
			}
			console.log(t);
			$('ol#posts').append(t);
		});
	};

})('HOME');

