// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Settings = fw.module('db_model').Settings;

var tmpl = fw.tmpl('../index.tmpl');

module.exports = function(conn, args, childRes, next){
	Settings.get('basic', function(err, r){
		if(err || !r) r = {};
		childRes.siteInfo = r;
		childRes.title = r.siteTitle || fw.config.app.title;
		conn.rpc('/backstage/post:get', {_id: args['*']}, function(r){
			if(!r) {
				childRes.content = tmpl(conn).notFound();
				return next(childRes);
			}
			childRes.content = tmpl(conn).single(r);
			if(r.title) childRes.title = r.title + ' | ' + childRes.title;
			next(childRes);
		});
	});
};