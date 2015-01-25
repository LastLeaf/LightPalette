// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var $content = $('#content').html(tmpl.main());
	var $tabs = $content.find('.addons_tabs');
	var $list = $content.find('.addons_list');

	var tabsLocked = false;
	var showList = function(tab){
		if(tabsLocked) return;
		tabsLocked = true;
		$tabs.children().removeClass('addons_tab_current');
		$tabs.children('.addons_tab_'+tab).addClass('addons_tab_current');
		if(tab === 'plugins') var method = 'addons:listPlugins';
		else var method = 'addons:listThemes';
		pg.rpc(method, function(res){
			$list.html(tmpl.list(res));
			tabsLocked = false;
		}, function(err){
			lp.backstage.showError(err);
			tabsLocked = false;
		});
	};
	showList('plugins');
});
