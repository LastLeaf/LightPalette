// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Settings = fw.module('db_model').Settings;
var User = fw.module('db_model').User;
var Series = fw.module('db_model').Series;
var Category = fw.module('db_model').Category;
var preservedPath = fw.module('preserved_path.js');

var tmpl = fw.tmpl('index.tmpl');

var LIST_LEN = 5;

var sitePathParser = function(conn, path, cb){
	// index
	if(!path) {
		var q = {
			from: 0,
			count: LIST_LEN
		};
		conn.rpc('/backstage/post:list', q, function(r){
			cb('index', '', '', 0, Math.ceil(r.total/LIST_LEN) || 0, r.rows);
		}, function(err){
			cb('index', '', '', 0, Math.ceil(r.total/LIST_LEN) || 0, []);
		});
		return;
	}
	var segs = path.split('?',2)[0].split('/');

	// basic listing funcs
	var postList = function(type, query, page, next){
		var q = {
			from: page*LIST_LEN,
			count: LIST_LEN
		};
		if(query) q[type] = query;
		conn.rpc('/backstage/post:list', q, function(r){
			if(!r || !r.rows.length) {
				if(next) next();
				else cb('404');
				return;
			}
			// get query name
			var queryNameGot = function(queryName){
				cb(type, query, queryName, page, Math.ceil(r.total/LIST_LEN) || 0, r.rows);
			};
			if(type === 'author') {
				User.findOne({_id: query}).select('displayName').exec(function(err, r){
					if(err || !r) cb('404');
					queryNameGot(r.displayName);
				});
			} else if(type === 'series') {
				Series.findOne({_id: query}).select('title').exec(function(err, r){
					if(err || !r) cb(query);
					queryNameGot(r.title);
				});
			} else if(type === 'category') {
				Category.findOne({_id: query}).select('title').exec(function(err, r){
					if(err || !r) cb(query);
					queryNameGot(r.title);
				});
			} else {
				queryNameGot(query);
			}
		}, function(err){
			cb('404');
		});
	};

	// special path
	if(preservedPath.check(path)) {
		var type = segs[0];
		if(type === 'index') {
			var page = (Number(segs[1]) || 1) - 1;
			postList('index', '', page);
			return;
		}
		var query = decodeURIComponent(segs[1]) || '';
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
		} else if(type === 'post') {
			conn.rpc('/backstage/post:read', {_id: query}, function(r){
				if(!r) cb('404');
				else cb('post', r.title, r.title, 0, 0, r);
			}, function(err){
				cb('404');
			});
		} else {
			cb('404');
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
	conn.rpc('/backstage/post:read', {path: decodeURI(path)}, function(r){
		if(!r) guess();
		else cb('post', r.title, r.title, 0, 0, r);
	}, guess);
};

module.exports = function(conn, args, childRes, next){
	Settings.get('basic', function(err, r){
		if(err || !r) r = {};
		childRes.siteInfo = r;
		childRes.title = r.siteTitle || fw.config.app.title;
		sitePathParser(conn, args['*'], function(type, query, queryName, page, totalPages, data){
			var title = query;
			if(type === '404') {
				childRes.content = tmpl(conn).notFound({ query: query, queryName: queryName });
				childRes.statusCode = 404;
			} else if(type === 'post') {
				childRes.content = tmpl(conn).single(data);
				if(title) childRes.title = title + ' | ' + childRes.title;
			} else {
				childRes.content = tmpl(conn).list({
					rows: data,
					type: type,
					query: query,
					queryName: queryName,
					pagePrev: page,
					pageNext: (page+2 > totalPages ? 0 : page+2),
				});
				if(title) childRes.title = title + ' | ' + childRes.title;
			}
			next(childRes);
		});
	});
};