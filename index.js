// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var fw = require('fw.mpa');

// read config
var config = {};
try {
	if(fs.existsSync('config.js')) var config = require(process.cwd() + '/config.js');
	else var config = JSON.parse(fs.readFileSync('config.json').toString('utf8'));
} catch(e) {}

// read lp's version in package.json
var lpVersion = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString('utf8')).version;

// start fw.mpa
var lpCoreRoot = __dirname + '/core';
fw({
	defaultMode: 'cache',
	ip: config.ip || '0.0.0.0',
	port: config.port || 1180,
	app: lpCoreRoot + '/sites_manager/sites.js',
	lpCoreRoot: lpCoreRoot,
	lpVersion: lpVersion,
});
