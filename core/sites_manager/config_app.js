// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');
var defaultLocales = JSON.parse(fs.readFileSync(fw.config.lpCoreRoot + '/locales.json').toString('utf8'));

// generate config
module.exports = function(app, siteInfo, cb){
	var id = siteInfo._id;
	var siteRoot = 'sites/' + id;
	var locales = siteInfo.locales || defaultLocales;

	// check favicon.ico and loading.gif
	var favicon = '';
	var loadingLogo = '';
	async.parallel([function(cb){
		fs.exists(siteRoot + '/favicon.ico', function(exists){
			if(exists) favicon = siteRoot + '/favicon.ico';
			cb();
		});
	}, function(cb){
		fs.exists(siteRoot + '/loading.gif', function(exists){
			if(exists) loadingLogo = siteRoot + '/loading.gif';
			cb();
		});
	}], function(){
		// build config object
		var config = {
			app: {
				siteId: id,
				siteRoot: siteRoot,
				safeMode: (siteInfo.status !== 'enabled'),
				enablePlugins: (siteInfo.status !== 'safeMode' && siteInfo.status !== 'safeModeTheme'),
				enableTheme: (siteInfo.status !== 'safeMode'),
				plugins: siteInfo.plugins,
				theme: siteInfo.theme,
				host: siteInfo.hosts,
				title: siteInfo.title || 'LightPalette',
				version: fw.config.lpVersion + '~' + String(Date.now()),
				locale: locales
			},
			client: {
				cache: siteRoot + '/cache',
				favicon: favicon,
				loadingLogo: loadingLogo,
				loadingLogoBackground: '#fff',
				meta: {
					viewport: 'width=device-width, initial-scale=1'
				}
			},
			db: {
				type: 'mongoose',
				host: app.config.db.host,
				port: app.config.db.port,
				user: app.config.db.user,
				password: app.config.db.password,
				name: app.config.db.name,
				globalPrefix: app.config.db.prefix,
				prefix: app.config.db.prefix + '.' + id + '.',
				sessionCollection: app.config.db.prefix + '.' + id + '.~sessions'
			},
			secret: {
				cookie: siteInfo.secret || '',
			}
		};
		cb(config);
	});
};
