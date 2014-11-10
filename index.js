// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var fw = require('fw.mpa');

// read config
process.chdir(__dirname);
var config = {};
if(fs.existsSync('config.js'))
	config = require('./config.js');
else if(fs.existsSync('config.json'))
	config = JSON.parse(fs.readFileSync('config.json').toString('utf8'));
else
	throw('You need a config.json file to start LightPalette.');

// read lp's version in package.json
var lpVersion = JSON.parse(fs.readFileSync('package.json').toString('utf8')).version;

// start fw.mpa
fw({
	ip: config.ip || '::',
	port: config.port || 80,
	app: 'core/app.js',
	lpVersion: lpVersion
});
