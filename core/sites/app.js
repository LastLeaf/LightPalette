// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var config = require('./config_sites.js');

module.exports = function(app){
	app.setConfig(config);
	var dirs = [
		['client', '/', fw.config.lpCoreRoot + '/sites/client'],
		['client', '/lib', fw.config.lpCoreRoot + '/client/lib'],
		['client', '/backstage/lib', fw.config.lpCoreRoot + '/client/backstage/lib'],
		['module', '/', fw.config.lpCoreRoot + '/sites/module'],
		['rpc', '/', fw.config.lpCoreRoot + '/sites/rpc']
	];
	dirs.forEach(function(dir, cb){
		app.bindDir.apply(app, dir.concat(cb));
	});
	app.route.setList(require('./routes.js'));
	app.start(function(){
		// TODO start enabled sites
	});
};
