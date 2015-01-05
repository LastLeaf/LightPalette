// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

// check favicon.ico and loading.gif
if(fs.existsSync('favicon.ico'))
	var favicon = 'favicon.ico';
else
	var favicon = '';
if(fs.existsSync('loading.gif'))
	var loadingLogo = 'loading.gif';
else
	var loadingLogo = '';

// generate config
module.exports = {
	app: {
		title: config.title || 'LightPalette',
		version: config.version || String(new Date().getTime()),
		locale: config.locale || [],
	},
	client: {
		cache: 'cache',
		favicon: favicon,
		loadingLogo: loadingLogo,
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
