// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');

// loading appconfig and routes
var appconfig = require('./appconfig.js');
var routes = require('./routes/routes.js');
var backstageRoutes = require('./routes/backstage/routes.js');

// check non-existed dirs
if(!fs.existsSync('static'))
	fs.mkdirSync('static');

module.exports = function(app){
	app.setConfig(appconfig);
	var dirs = [
		['client', '/', 'core/client'],
		['client', '/theme', 'themes/default'],
		['module', '/', 'core/module'],
		['page', '/', 'core/page'],
		['render', '/', 'core/render'],
		['rpc', '/', 'core/rpc'],
		['static', '/', 'static'],
	];
	async.each(dirs, function(dir, cb){
		app.bindDir.apply(app, dir.concat(cb));
	}, function(){
		app.route.setList(routes);
		app.route.setList('/backstage', backstageRoutes);
		app.start();
	});
};
