// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var async = require('async');
var Settings = fw.module('db_model').Settings;
var ThemeSettings = fw.module('db_model').ThemeSettings;
var StatPath = fw.module('db_model').StatPath;
var pathMatching = fw.module('path_matching');

var tmpl = fw.tmpl('content.tmpl');

module.exports = function(conn, args, childRes, next){
	async.map(['basic', 'stat'], function(key, cb){
		Settings.get(key, cb);
	}, function(err, settings){
		var siteInfo = settings[0];
		var statEnabled = settings[1] && settings[1].enabled;
		ThemeSettings.get(conn.app.config.app.theme, function(err, themeSettings){
			if(!siteInfo) siteInfo = {};
			childRes.statEnabled = statEnabled;
			childRes.siteInfo = siteInfo;
			childRes.themeSettings = themeSettings;
			var path = args['*'];
			pathMatching(conn, path, function(type, query, queryName, page, totalPages, data){
				if(type === '404') {
					// not found
					var renderData = {
						siteInfo: siteInfo,
						themeSettings: themeSettings,
						query: query,
						queryName: queryName,
						notFound: true
					};
					childRes.statusCode = 404;
					childRes.content = tmpl(conn).notFound(renderData);
				} else if(type === 'post') {
					// single post
					var renderData = {
						siteInfo: siteInfo,
						themeSettings: themeSettings,
						query: query,
						queryName: queryName,
						post: data
					};
					childRes.content = tmpl(conn).single(renderData);
				} else {
					// post list
					var renderData = {
						siteInfo: siteInfo,
						themeSettings: themeSettings,
						posts: data,
						type: type,
						query: query,
						queryName: queryName,
						pagePrev: page,
						pageNext: (page+2 > totalPages ? 0 : page+2),
					};
					childRes.content = tmpl(conn).list(renderData);
				}
				if(tmpl(conn).title) childRes.title = tmpl(conn).title(renderData);
				if(!childRes.title || !childRes.title.match(/\S/)) childRes.title = siteInfo.siteTitle || conn.app.config.app.title;
				next(childRes);
				// log into stat
				if(!statEnabled) return;
				var time = Math.floor(new Date().getTime() / 1000);
				new StatPath({ path: path, time: time, sid: conn.session.id, ip: conn.ips.concat(conn.ip).join(' ') }).save();
			});
		});
	});
};
