// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;

	var content = document.getElementById('content');
	var contentDisplay = content.style.display;
	pg.on('render', function(res){
		document.title = res.title;
		content.style.display = 'none';
		content.innerHTML = res.content;
	});
	pg.on('childUnload', function(){
		content.innerHTML = '';
	});
	pg.on('load', function(){
		if(lp.theme) lp.theme(pg);
		pg.emit('wrapperLoaded');
	});
	pg.on('childLoadEnd', function(){
		content.style.display = contentDisplay;
		pg.emit('contentLoaded');
	});
});