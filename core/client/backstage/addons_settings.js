// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var type = fw.getPath();
	var id = type.slice(type.lastIndexOf('/') + 1);
	type = type.slice(0, type.lastIndexOf('/'));
	type = type.slice(type.lastIndexOf('/') + 1);
	var $content = $('#content').html(tmpl.main({
		plugin: (type === 'plugin'),
		theme: (type === 'theme')
	}));

	var showConfig = function(config){
		if(typeof(config.title === 'object')) config.title = config.title[fw.language] || config.title[''] || '';
		$content.find('.addons_tabs_title').text(config.title);
	};
	if(type === 'plugin') {
		pg.rpc('addons:loadedPluginInfo', id, showConfig);
	} else {
		pg.rpc('addons:loadedThemeInfo', showConfig);
	}
});
