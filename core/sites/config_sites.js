// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var locales = JSON.parse(fs.readFileSync(fw.config.lpCoreRoot + '/sites/locales.json').toString('utf8'));

// read and watch config file
var config = null;
try {
	var config = JSON.parse(fs.readFileSync('config.json').toString('utf8'));
	fs.watch('config.json', function(){
		try { fw.restart(); } catch(e) {}
	});
} catch(e) {}

// generate config
if(config) {
	// start normally
	module.exports = {
		app: {
			title: config.title || 'LightPalette',
			version: String(Date.now()),
			locale: locales,
		},
		client: {
			cache: 'cache',
			favicon: fw.config.lpCoreRoot + '/images/favicon.ico',
			loadingLogo: fw.config.lpCoreRoot + '/images/logo.gif',
			loadingLogoBackground: '#fff',
			meta: {
				viewport: 'width=device-width, initial-scale=1'
			}
		},
		db: {
			type: 'mongoose',
			host: config.dbHost || 'localhost',
			port: config.dbPort || 27017,
			user: config.dbUser,
			password: config.dbPassword,
			name: config.dbName,
			prefix: config.dbPrefix,
		},
		secret: {
			cookie: config.secret,
		},
	};
} else {
	// request installation
	module.exports = {
		app: {
			title: 'LightPalette',
			version: String(Date.now()),
			locale: locales,
		},
		client: {
			cache: 'cache/~sites',
			favicon: fw.config.lpCoreRoot + 'images/favicon.ico',
			loadingLogo: fw.config.lpCoreRoot + 'images/logo.gif',
			loadingLogoBackground: '#fff',
			meta: {
				viewport: 'width=device-width, initial-scale=1'
			}
		},
		db: {
			type: 'none',
		},
		secret: {
			cookie: 'LightPalette',
		},
	};
}
