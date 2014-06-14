// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;

	// read user info
	var wrapper = document.getElementById('wrapper');
	pg.userInfo = {
		_id: wrapper.getAttribute('user-id'),
		displayName: wrapper.getAttribute('user-displayName')
	};

	pg.on('render', function(res){
		document.title = res.title;
		document.getElementById('content').innerHTML = res.content;
	});
	pg.on('load', function(){
		if(lp.theme) lp.theme(pg);
		pg.emit('wrapperLoaded');
	});
	pg.on('childUnload', function(){
		content.innerHTML = '';
		pg.emit('contentUnloaded');
	});
	pg.on('childLoadEnd', function(){
		document.body.scrollTop = 0;
		pg.emit('contentLoaded');
	});
});