// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var type = fw.getPath();
	type = type.slice(0, type.lastIndexOf('/'));
	type = type.slice(type.lastIndexOf('/') + 1);
	var $content = $('#content').html(tmpl.main({
		plugin: (type === 'plugin'),
		theme: (type === 'theme')
	}));
});
