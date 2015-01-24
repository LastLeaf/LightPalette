// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var sitesConfig = require('./config_sites.js');

var startSites = function(app){
	if(!app.db) return;
	var dbSites = app.loadedModules['/db_sites.js'];
	var siteController = app.loadedModules['/site_controller.js'];
	dbSites.find({}, function(err, sites){
		if(err) return;
		for(var i=0; i<sites.length; i++) {
			if(sites[i].status === 'enabled') siteController.start(sites[i].toObject());
		}
	});
};

module.exports = function(app){
	// init app
	app.setConfig(sitesConfig());
	var dirs = [
		['client', '/', fw.config.lpCoreRoot + '/sites/client'],
		['client', '/lib', fw.config.lpCoreRoot + '/client/lib'],
		['client', '/backstage/lib', fw.config.lpCoreRoot + '/client/backstage/lib'],
		['module', '/', fw.config.lpCoreRoot + '/sites/module'],
		['render', '/', fw.config.lpCoreRoot + '/sites/render'],
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
