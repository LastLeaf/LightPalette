// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var fw = require('fw.mpa');

// read config
process.chdir(__dirname);
var config = {};
try {
	config = JSON.parse(fs.readFileSync('config.json').toString('utf8'));
} catch(e) {}

// read lp's version in package.json
var lpVersion = JSON.parse(fs.readFileSync('package.json').toString('utf8')).version;

// start fw.mpa
fw({
	ip: config.ip || '0.0.0.0',
	port: config.port || 1180,
	app: 'core/sites/sites.js',
	lpVersion: lpVersion
});
