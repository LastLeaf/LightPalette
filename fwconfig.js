// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

// read and watch config file
var config = JSON.parse(fs.readFileSync('config.json').toString('utf8'));
fs.watch('config.json', function(){
	fw.restart();
});

// generate config
module.exports = {
	app: {
		title: 'LightPalette',
		version: config.version || new Date().getTime(),
		locale: ['zh_CN'],
	},
	client: {
		loadingLogo: 'logo.gif',
		loadingLogoBackground: '#ddd',
	},
	server: {
		port: 1180,
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