/*
 * key value to object
 * kv2obj('key1',1) will return {key1:1}
 */
function kv2obj(){
	var c=arguments,l=c.length;
	var r={};
	for(var i=0;i<l-1;i+=2){
		r[c[i]]=c[i+1];
	}
	return r;
}
