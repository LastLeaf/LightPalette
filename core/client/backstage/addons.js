// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var $content = $('#content').html(tmpl.main());
	var $tabs = $content.find('.addons_tabs');
	var $list = $content.find('.addons_list');

	// status click events
	var multiSelect = false;
	$list.on('click', '.addons_status', function(){
		var $status = $(this);
		if(multiSelect) {
			if($status.hasClass('addons_status-enabled')) {
				// disable
				$status.removeClass('addons_status-enabled').addClass('addons_status-disable').text(_('Will Disable'));
			} else if($status.hasClass('addons_status-enable')) {
				// cancel enable
				$status.removeClass('addons_status-enable').addClass('addons_status-disabled').text(_('Disabled'));
			} else if($status.hasClass('addons_status-disabled')) {
				// cancel enable
				$status.removeClass('addons_status-disabled').addClass('addons_status-enable').text(_('Will Enable'));
			} else if($status.hasClass('addons_status-disable')) {
				// cancel enable
				$status.removeClass('addons_status-disable').addClass('addons_status-enabled').text(_('Enabled'));
			}
		} else {
			// select the clicked
			if($status.hasClass('addons_status-disabled') || $status.hasClass('addons_status-disable')) {
				$list.find('.addons_status-enable').removeClass('addons_status-enable').addClass('addons_status-disabled').text(_('Disabled'));
				$list.find('.addons_status-enabled').removeClass('addons_status-enabled').addClass('addons_status-disable').text(_('Will Disable'));
				$status.removeClass('addons_status-disabled').removeClass('addons_status-disable').addClass('addons_status-enable').text(_('Will Enable'));
			}
		}
	});

	// apply button
	$list.find('.addons_apply').click(function(){
		if(tabsLocked) return;
		var $apply = $(this).attr('disabled', true);
		if(curTab === 'plugins') var method = 'addons:alterPlugins';
		else var method = 'addons:alterThemes';
		var enable = [];
		$list.find('.addons_status-enable').each(function(){
			enable.push($(this).attr('addonId'));
		});
		var disable = [];
		$list.find('.addons_status-disable').each(function(){
			disable.push($(this).attr('addonId'));
		});
		pg.rpc(method, {enable: enable.join('\n'), disable: disable.join('\n'), restart: 'yes'}, function(){}, function(err){
			lp.backstage.showError(err);
			$apply.removeAttr('disabled');
		});
		setTimeout(function(){
			pg.rpc('user:current');
		}, 3000);
	});

	// show list content
	var curTab = '';
	var tabsLocked = false;
	var showList = function(tab){
		if(tabsLocked) return;
		tabsLocked = true;
		curTab = tab;
		$list.html('');
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
	$tabs.find('.addons_tab').click(function(){
		var $tab = $(this);
		var tab = 'plugins';
		multiSelect = true;
		if($tab.hasClass('addons_tab_themes')) {
			tab = 'themes';
			multiSelect = false;
		}
		showList(tab);
	});
	showList('plugins');
});
