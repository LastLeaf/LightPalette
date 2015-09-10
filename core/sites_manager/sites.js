// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var async = require('async');
var sitesConfig = require('./config.js');

var startSites = function(app){
	if(!app.db) return;
	var dbSites = app.loadedModules['/db_sites.js'];
	var siteController = app.loadedModules['/site_controller.js'];
	dbSites.find().sort('_id').exec(function(err, sites){
		if(err) return;
		async.eachSeries(sites, function(site, cb){
			if(site.status !== 'disabled') siteController.start(site.toObject(), function(){ cb() });
			else cb();
		}, function(){
			console.log('LightPalette started.');
		});
	});
};

module.exports = function(app){
	// init app
	app.setConfig(sitesConfig());
	var dirs = [
		['client', '/', fw.config.lpCoreRoot + '/sites_manager/client'],
		['client', '/lib', fw.config.lpCoreRoot + '/client/lib'],
		['client', '/backstage/lib', fw.config.lpCoreRoot + '/client/backstage/lib'],
		['module', '/', fw.config.lpCoreRoot + '/sites_manager/module'],
		['render', '/', fw.config.lpCoreRoot + '/sites_manager/render'],
		['rpc', '/', fw.config.lpCoreRoot + '/sites_manager/rpc']
	];
	dirs.forEach(function(dir, cb){
		app.bindDir.apply(app, dir.concat(cb));
	});
	app.route.setList(require('./routes.js'));
	app.start(function(){
		startSites(app);
	});
};
