// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	pg.on('childLoadEnd', function(){
		fw.loadingLogo.disabled = true;
	});

	// forestage drivers
	var exports = {};
	var drivers = {};
	exports.driver = function(id, args){
		if(typeof(args) === 'function') drivers[id] = args;
		else if(drivers[id]) drivers[id](args);
	};

	// default no avatar support
	exports.avatarUrl = function(userInfo, size){
		return '';
	};

	// login/out helper
	exports.register = function(id, password, email, cb, errCb){
		cb = cb || function(){};
		pg.rpc('/backstage/user:register', { id: id, password: CryptoJS.SHA256(id.toLowerCase()+'|'+password), email: email }, cb, errCb);
	};
	exports.login = function(id, password, cb, errCb){
		cb = cb || function(){};
		pg.rpc('/backstage/user:login', { id: id, password: CryptoJS.SHA256(id.toLowerCase()+'|'+password) }, function(){
			if(cb() !== false)
				setTimeout(function(){
					location.reload();
				}, 0);
		}, errCb);
	};
	exports.logout = function(cb, errCb){
		cb = cb || function(){};
		pg.rpc('/backstage/user:logout', function(err){
			if(cb() !== false)
				setTimeout(function(){
					location.reload();
				}, 0);
		}, errCb);
	};

	// comments helper
	exports.comments = {
		list: function(postId, options, cb, errCb){
			if(typeof(options) === 'function') {
				errCb = cb;
				cb = options;
				options = null;
			}
			if(!options) options = {};
			fw.getPage().rpc('/backstage/comment:list', {root: '', depth: 4, post: postId, desc: options.desc?'yes':''}, cb, errCb);
		},
		getReplies: function(commentId, options, cb, errCb){
			if(typeof(options) === 'function') {
				errCb = cb;
				cb = options;
				options = null;
			}
			if(!options) options = {};
			fw.getPage().rpc('/backstage/comment:list', {root: commentId, depth: 4, post: postId, desc: options.desc?'yes':''}, cb, errCb);
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

	return exports;
});
