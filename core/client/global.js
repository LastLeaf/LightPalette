// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	// init
	window.lp = {};
	pg.on('childLoadEnd', function(){
		fw.loadingLogo.disabled = true;
	});

	// forestage drivers
	var drivers = {};
	lp.drivers = {
		init: function(id, args){
			if(typeof(args) === 'function') drivers[id] = args;
			else if(drivers[id]) drivers[id](args);
		}
	};

	// gravatar helper
	lp.gravatarUrl = function(email, size, def){
		var url = 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email) + '?d=' + encodeURIComponent(def || 'mm');
		if(size) url += '&s=' + size;
		return url;
	};

	// login/out helper
	lp.register = function(id, password, email, cb, errCb){
		cb = cb || function(){};
		pg.rpc('/backstage/user:register', { id: id, password: CryptoJS.SHA256(id.toLowerCase()+'|'+password), email: email }, cb, errCb);
	};
	lp.login = function(id, password, cb, errCb){
		cb = cb || function(){};
		pg.rpc('/backstage/user:login', { id: id, password: CryptoJS.SHA256(id.toLowerCase()+'|'+password) }, function(){
			if(cb() !== false)
				setTimeout(function(){
					location.reload();
				}, 0);
		}, errCb);
	};
	lp.logout = function(cb, errCb){
		cb = cb || function(){};
		pg.rpc('/backstage/user:logout', function(err){
			if(cb() !== false)
				setTimeout(function(){
					location.reload();
				}, 0);
		}, errCb);
	};

	// comments helper
	lp.comments = {
		list: function(postId, desc, cb, errCb){
			if(typeof(desc) === 'function') {
				errCb = cb;
				cb = desc;
				desc = null;
			}
			fw.getPage().rpc('/backstage/comment:list', {root: '', depth: 4, post: postId, desc: desc?'yes':''}, cb, errCb);
		},
		getReplies: function(commentId, desc, cb, errCb){
			if(typeof(desc) === 'function') {
				errCb = cb;
				cb = desc;
				desc = null;
			}
			fw.getPage().rpc('/backstage/comment:list', {root: commentId, depth: 4, post: postId, desc: desc?'yes':''}, cb, errCb);
		},
		add: function(args, cb, errCb){
			fw.getPage().rpc('/backstage/comment:create', args, cb, errCb);
		},
		form: function(form, submitCb, cb, errCb){
			form.setAttribute('fw', '');
			form.setAttribute('action', '/backstage/comment');
			form.setAttribute('method', 'create');
			fw.getPage().form(form, submitCb, cb, errCb);
		}
	};
});
