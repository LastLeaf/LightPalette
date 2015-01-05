// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

// site properties: id title version

var config = require('./config_sites.js');

module.exports = function(app){
	app.setConfig(config);
	var dirs = [
		['client', '/', 'core/sites/client'],
		['client', '/lib', 'core/client/lib'],
		['module', '/', 'core/client/module'],
		['rpc', '/', 'core/sites/rpc']
	];
	dirs.forEach(function(dir, cb){
		app.bindDir.apply(app, dir.concat(cb));
	});
	app.route.setList(require('./routes.js'));
	if(config.db.type === 'none') app.route.set('/', {redirect: '/install'});
	else app.route.set('/install', {redirect: '/'});
	app.start();
};
