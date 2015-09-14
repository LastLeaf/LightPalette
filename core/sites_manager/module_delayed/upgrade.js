// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var async = require('async');
var dbSettings = fw.module('db_settings.js');
var dbSites = fw.module('db_sites.js');

var upgradeSite = function(id, fromVer, toVer, cb){
	// TODO: run update script
	setTimeout(cb, 0);
};

var upgradeSites = function(app, cb){
	dbSettings.get('lightpalette', function(err, version){
		if(!version) {
			dbSettings.set('lightpalette', fw.config.lpVersion, cb);
			return;
		}
		if(version !== fw.config.lpVersion) {
			// list sites and upgrade each
			dbSites.find().sort('_id').exec(function(err, sites){
				async.eachSeries(sites, function(site, cb){
					if(site.type !== '' && site.type !== 'sites') return cb();
					console.log('Upgrading site: ' + site.title);
					upgradeSite(site._id, version, fw.config.lpVersion, cb);
				}, function(err){
					if(!err) return cb();
					console.log('Upgrade sites failed. Would try later if possible.');
					setTimeout(function(){
						try {
							fw.restart();
						} catch(e) {
							process.exit();
						}
					}, 5000);
				});
			});
		}
	});
};

module.exports = function(app, cb){
	if(!dbSettings) return cb();
	upgradeSites(app, function(){
		cb({
			upgradeSite: upgradeSite
		});
	});
};
