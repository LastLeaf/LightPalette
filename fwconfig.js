// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

// read and watch config file
if(fs.existsSync('config.js')) {
	var config = require('./config.js')();
	fs.watch('config.js', function(){
		fw.restart();
	});
} else {
	var config = JSON.parse(fs.readFileSync('config.json').toString('utf8'));
	fs.watch('config.json', function(){
		fw.restart();
	});
}

// check favicon.ico and logo.gif
if(fs.existsSync('rc/favicon.ico'))
	var favicon = 'favicon.ico';
else
	var favicon = 'default_favicon.ico';
if(fs.existsSync('rc/loading.gif'))
	var loadingLogo = 'loading.gif';
else
	var loadingLogo = 'default_loading.gif';

// generate config
module.exports = {
	app: {
		title: config.title || 'LightPalette',
		version: config.version || String(new Date().getTime()),
		locale: config.locale || [],
	},
	client: {
		favicon: favicon,
		loadingLogo: loadingLogo,
		loadingLogoBackground: '#fff',
	},
	server: {
		ip: config.host || '',
		port: config.port || 1180,
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