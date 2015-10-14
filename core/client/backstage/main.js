// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.mainAsync(function(pg, subm, cb){
	var tmpl = pg.tmpl;
	var exports = {};

	// driver manager
	var drivers = {};
	exports.driver = (function(){
		var exports = {};
		exports.define = function(id, options){
			drivers[id] = options;
		};
		exports.list = function(userType){
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
		exports.getName = function(id){
			if(drivers[id]) return drivers[id].name;
			return '';
		};
		exports.editor = function(id, div, data, userInfo){
			if(drivers[id] && drivers[id].editor)
				return drivers[id].editor(div, data, userInfo);
		};
		return exports;
	})();

	// create div structure
	var lpVersion = fw.version;
	if(lpVersion.indexOf('~') >= 0) lpVersion = lpVersion.slice(0, lpVersion.indexOf('~'));
	var $backstage = $(tmpl.main({ lpVersion: lpVersion, lpLang: fw.language, siteTitle: document.title })).appendTo(document.body);
	$('#content').html(tmpl.busy());
	// define page switch method
	var $tabbar = $backstage.find('#tabbar');
	var showLoading = function(){
		$('#content').html(tmpl.busy());
	};
	pg.on('childUnload', showLoading);
	var updateTabStyle = function(){
		// update active tab
		var path = fw.getPath().match(/^\/[^\/]+\/(\w+)/);
		var tabId = path[1];
		$tabbar.find('.tab_current').removeClass('tab_current');
		$tabbar.find('.tab_'+tabId).addClass('tab_current');
		// update header list
		var $nav = $headerLists.find('.tab_nav');
		if(!$nav) return;
		$nav.children('.header_list_title').html( $nav.children('.header_list_items').children('[href="/backstage/' + tabId + '"]').html() );
	}
	pg.on('childLoadStart', updateTabStyle);

	// capture the height of page
	$(window).resize(function(){
		$('#backstage').height(document.documentElement.clientHeight);
	});
	$('#backstage').height(document.documentElement.clientHeight);

	// show error
	var $errors = $('#errors');
	exports.showError = function(err, detail){
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
			var permission = { contrib: true, write: true, edit: true, admin: true };
		} else if(info.type === 'editor') {
			var permission = { contrib: true, write: true, edit: true };
		} else if(info.type === 'writer') {
			var permission = { contrib: true, write: true };
		} else if(info.type === 'contributor') {
			var permission = { contrib: true };
		} else {
			var permission = {};
		}
		$('#tabbar').html(tmpl.userTabs(permission));
		updateTabStyle();
		// show user bar
		if(info._id) {
			permission.displayName = info.displayName;
			$headerLists.html(tmpl.userInfo(permission))
				.find('.logout').click(function(e){
					e.preventDefault();
					lp.logout(function(){
						location.href = '/backstage/home';
						return false;
					});
				});
		} else {
			// show language selection instead
			pg.rpc('user:locales', function(names){
				$headerLists.html(tmpl.langSelect({
					current: names[fw.language],
					names: names
				})).on('click', '.header_item', function(){
					var $this = $(this);
					fw.selectLanguage($this.attr('locale'));
				});
			});
		}
		exports.userInfo = info;
		if(info._id || fw.getPath() === '/backstage/home') cb(exports);
		else fw.go('/backstage/home');
	}, exports.showError);

	// header list events
	var $headerLists = $('#header_lists').on('click', '.header_list_title', function(){
		$(this).closest('.header_list').toggleClass('header_list-active').css('max-height', document.documentElement.clientHeight + 'px');
	}).on('blur', '.header_list', function(){
		$(this).removeClass('header_list-active');
	}).on('click', '.header_item', function(){
		var $this = $(this);
		$this.closest('.header_list').removeClass('header_list-active');
		if($this.attr('href')) fw.go($this.attr('href'));
	});

	// simple popup API
	var popupQueue = [];
	var $popupWrapper = $('#popup_wrapper');
	var addPopup = function($popup){
		popupQueue.push($popup);
		if(popupQueue.length === 1) {
			$popupWrapper.show();
			$popup.appendTo( $popupWrapper.html('') ).find('.popup_button').focus();
		}
	};
	var removePopup = function(){
		popupQueue.shift();
		if(popupQueue.length) {
			popupQueue[0].appendTo( $popupWrapper.html('') ).find('.popup_button').focus();
		} else {
			$popupWrapper.html('').hide();
		}
	};
	exports.alert = function(message, cb){
		var $popup = $(tmpl.alert({
			message: message
		}));
		$popup.find('.popup_button').click(function(e){
			e.preventDefault();
			removePopup();
			if(cb) cb();
		});
		addPopup($popup);
	};
	exports.confirm = function(message, cb){
		var $popup = $(tmpl.confirm({
			message: message
		}));
		$popup.find('.popup_button').click(function(e){
			e.preventDefault();
			removePopup();
			if(cb) cb( $(this).attr('popupValue') === 'OK' );
		});
		addPopup($popup);
	};
});
