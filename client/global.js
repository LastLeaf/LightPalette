// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	// init
	window.lp = {};
	pg.on('childLoadEnd', function(){
		fw.loadingLogo.disabled = true;
	});

	// gravatar helper
	lp.gravatarUrl = function(email, size, def){
		var url = 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email) + '?d=' + encodeURIComponent(def || 'mm');
		if(size) url += '&s=' + size;
		return url;
	};
	
	// login/out helper
	lp.register = function(id, password, email, cb){
		cb = cb || function(){};
		pg.rpc('/lp.backstage/user:register', { id: id, password: CryptoJS.SHA256(id.toLowerCase()+'|'+password), email: email }, function(err){
			if(err) cb(err);
			else {
				cb();
			}
		}, function(){
			cb({timeout: true});
		});
	};
	lp.login = function(id, password, cb){
		cb = cb || function(){};
		pg.rpc('/lp.backstage/user:login', { id: id, password: CryptoJS.SHA256(id.toLowerCase()+'|'+password) }, function(err){
			if(err) cb(err);
			else {
				cb();
				setTimeout(function(){
					location.reload();
				}, 0);
			}
		}, function(){
			cb({timeout: true});
		});
	};
	lp.logout = function(cb){
		cb = cb || function(){};
		pg.rpc('/lp.backstage/user:logout', function(err){
			if(err) cb(err);
			else {
				cb();
				setTimeout(function(){
					location.reload();
				}, 0);
			}
		}, function(){
			cb({timeout: true});
		});
	};
});