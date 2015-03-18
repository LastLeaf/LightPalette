// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Settings = fw.module('db_model').Settings;
var ThemeSettings = fw.module('db_model').ThemeSettings;

var tmpl = fw.tmpl('../content.tmpl');

module.exports = function(conn, args, childRes, next){
	Settings.get('basic', function(err, siteInfo){
		ThemeSettings.get(conn.app.config.app.theme, function(err, themeSettings){
			if(!siteInfo) siteInfo = {};
			childRes.siteInfo = siteInfo;
			childRes.themeSettings = themeSettings;
			conn.rpc('/backstage/post:get', {_id: args['*']}, function(r){
				// single post
				var renderData = {
					siteInfo: siteInfo,
					themeSettings: themeSettings,
					query: r.title,
					queryName: r.title,
					post: r
				};
				childRes.content = tmpl(conn).single(renderData);
				if(tmpl(conn).title) childRes.title = tmpl(conn).title(renderData);
				if(!childRes.title || !childRes.title.match(/\S/)) childRes.title = siteInfo.siteTitle || conn.app.config.app.title;
				next(childRes);
			}, function(err){
				// not found
				var renderData = {
					siteInfo: siteInfo,
					themeSettings: themeSettings,
					query: undefined,
					queryName: undefined,
					notFound: true
				};
				childRes.statusCode = 404;
				childRes.content = tmpl(conn).notFound(renderData);
				if(tmpl(conn).title) childRes.title = tmpl(conn).title(renderData);
				if(!childRes.title || !childRes.title.match(/\S/)) childRes.title = siteInfo.siteTitle || conn.app.config.app.title;
				next(childRes);
			});
		});
	});
};
