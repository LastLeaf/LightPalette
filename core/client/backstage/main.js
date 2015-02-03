// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.mainAsync(function(pg, subm, cb){
	var tmpl = pg.tmpl;
	lp.tableBuilder.i18n = tmpl.i18n;
	lp.backstage = {};

	// driver manager
	(function(){
		var drivers = {};
		lp.backstage.driver = function(id, options){
			drivers[id] = options;
		};
		lp.backstage.driverList = function(userType){
			var r = [];
			for(var k in drivers) {
				if(drivers[k].permission) {
					var permission = drivers[k].permission;
					if(permission === 'admin' && userType !== 'admin')
						continue;
					if(permission === 'editor' && userType !== 'admin' && userType !== 'editor')
						continue;
					if(permission === 'writer' && userType !== 'admin' && userType !== 'editor' && userType !== 'writer')
						continue;
				}
				r.push({
					id: k,
					name: drivers[k].name
				});
			}
			return r;
		};
		lp.backstage.driverName = function(id){
			if(drivers[id]) return drivers[id].name;
			return '';
		};
		lp.backstage.driverEditor = function(id, div, data, userInfo){
			if(drivers[id] && drivers[id].editor)
				return drivers[id].editor(div, data, userInfo);
		};
	})();

	// create div structure
	var lpVersion = fw.version;
	if(lpVersion.indexOf('~') >= 0) lpVersion = lpVersion.slice(0, lpVersion.indexOf('~'));
	var $backstage = $(tmpl.main()).appendTo(document.body);
	$('#content').html(tmpl.busy());
	// define page switch method
	var $tabbar = $backstage.find('#tabbar');
	lp.backstage.showBusy = function(){
		$('#content').html(tmpl.busy());
	};
	pg.on('childUnload', lp.backstage.showBusy);
	lp.backstage.updateTabStyle = function(){
		var path = fw.getPath().match(/^\/[^\/]+\/(\w+)/);
		var tabId = path[1];
		$tabbar.find('.tab_current').removeClass('tab_current');
		$tabbar.find('.tab_'+tabId).addClass('tab_current');
	};
	pg.on('childLoadStart', lp.backstage.updateTabStyle);

	// capture the height of page
	$(window).resize(function(){
		$('#backstage').height(document.documentElement.clientHeight);
	});
	$('#backstage').height(document.documentElement.clientHeight);

	// show error
	var $errors = $('#errors');
	lp.backstage.showError = function(err, detail){
		var hidden = false;
		err = err || 'timeout';
		var str = tmpl.error[err] || err;
		if(detail) str += ' ' + detail;
		var $error = $('<div></div>').text(str).appendTo($errors).hide().fadeIn(200).click(function(){
			if(hidden) return;
			hidden = true;
			$error.fadeOut(200, function(){
				$error.remove();
			});
		});
	};

	// send an rpc to get the user's type
	pg.rpc('user:current', function(info){
		// show tabbar
		if(info.type === 'admin') {
			var html = tmpl.userTabs({ contrib: true, write: true, edit: true, admin: true });
		} else if(info.type === 'editor') {
			var html = tmpl.userTabs({ contrib: true, write: true, edit: true });
		} else if(info.type === 'writer') {
			var html = tmpl.userTabs({ contrib: true, write: true });
		} else if(info.type === 'contributor') {
			var html = tmpl.userTabs({ contrib: true });
		} else {
			var html = tmpl.userTabs();
		}
		$('#tabbar').html(html);
		lp.backstage.updateTabStyle();
		// show user bar
		if(info._id)
			$('.header_right').html(tmpl.userInfo(info))
				.find('.logout').click(function(e){
					e.preventDefault();
					lp.logout(function(){
						location.href = '/backstage/home';
						return false;
					});
				});
		lp.backstage.userInfo = info;
		if(info._id || fw.getPath() === '/backstage/home') cb();
		else fw.go('/backstage/home');
	}, lp.backstage.showError);
});
