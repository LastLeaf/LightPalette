// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Settings = fw.module('db_model').Settings;
var sitePathParser = fw.module('site_path_parser.js');

var tmpl = fw.tmpl('index.tmpl');

var LIST_LEN = 5;

var sitePathParser = function(conn, path, cb){
	// index
	if(!path) {
		var q = {
			from: 0,
			count: LIST_LEN
		};
		conn.rpc('/lp.backstage/post:list', q, function(r){
			cb('index', '', 0, r);
		}, function(err){
			cb('index', '', 0, []);
		});
		return;
	}
	var segs = path.split('/');

	// basic listing funcs
	var postList = function(type, query, page, next){
		var q = {
			from: page*LIST_LEN,
			count: LIST_LEN
		};
		if(query) q[type] = query;
		conn.rpc('/lp.backstage/post:list', q, function(r){
			if(!r || !r.rows.length) {
				if(next) next();
				else cb('404');
				return;
			}
			cb(type, query, page, r);
		}, function(err){
			cb('404');
		});
	};

	// special path
	if(segs[0].slice(0, 3) === 'lp.') {
		var type = segs[0].slice(3);
		if(type === 'index') {
			var page = (Number(segs[1]) || 1) - 1;
			postList('index', '', page);
			return;
		}
		var query = decodeURIComponent(segs[1]);
		var page = (Number(segs[2]) || 1) - 1;
		if(type === 'tag') {
			postList('tag', query, page);
		} else if(type === 'category') {
			postList('category', query, page);
		} else if(type === 'series') {
			postList('series', query, page);
		} else if(type === 'author') {
			postList('author', query, page);
		} else if(type === 'search') {
			postList('search', query, page);
		}
		return;
	}

	// category - author - series - title - search
	var guess = function(){
		var query = decodeURIComponent(segs[0]);
		var page = (Number(segs[1]) || 1) - 1;
		postList('category', query, page, function(){
			postList('author', query, page, function(){
				postList('series', query, page, function(){
					postList('title', query, page, function(){
						postList('search', query, page);
					});
				});
			});
		});
	};

	// path
	var tryPath = function(){
		conn.rpc('/lp.backstage/post:read', {path: path}, function(r){
			if(!r) guess();
			else cb('post', r.title, 0, r);
		}, guess);
	};

	// post id
	if(path.match(/^[0-9a-f]{24}$/)) {
		conn.rpc('/lp.backstage/post:read', {_id: path}, function(r){
			if(!r) tryPath();
			else cb('post', r.title, 0, r);
		}, tryPath);
	} else {
		tryPath();
	}
};

module.exports = function(conn, args, childRes, next){
	Settings.get('basic', function(err, r){
		if(err) return next(childRes);
		if(!r) r = {};
		childRes.siteInfo = r;
		childRes.title = r.siteTitle || fw.config.app.title;
		sitePathParser(conn, args['*'], function(type, query, page, data){
			var title = query;
			if(type === '404') {
				childRes.content = tmpl(conn).notFound();
			} else if(type === 'post') {
				childRes.content = tmpl(conn).single(data);
				if(title) childRes.title = title + '|' + childRes.title;
			} else {
				childRes.content = tmpl(conn).list({
					rows: data.rows,
					type: type,
					query: query,
					pagePrev: page,
					pageNext: page+2,
				});
				if(title) childRes.title = title + '|' + childRes.title;
			}
			next(childRes);
		});
	});
};