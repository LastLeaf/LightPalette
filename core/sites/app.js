// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var config = require('./config_sites.js');

var startSites = function(app){
	if(!app.db) return;
	var dbData = app.loadedModules['/db_data.js'];
	var siteController = app.loadedModules['/site_controller.js'];
	dbData.getByType('site', 0, 0, function(err, sites){
		if(err) return;
		for(var i=0; i<sites.length; i++) {
			if(sites[i].status === 'enabled') siteController.start(sites[i]);
		}
	});
};

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
		startSites(app);
	});
};
