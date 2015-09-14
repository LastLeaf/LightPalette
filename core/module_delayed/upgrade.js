// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');
var semver = require('semver');
var dbSettings = fw.module('/db_model').Settings;

var upgradeVersions = function(app, fromVer, stepCb, cb){
	var dir = fw.config.lpCoreRoot + '/upgrade';
	fs.readdir(dir, function(err, files){
		if(err) return cb(err);
		var versions = [];
		files.forEach(function(file){
			if(file.slice(-3) !== '.js') return;
			var ver = file.slice(0, -3);
			if(semver.valid(ver) && semver.lte(ver, fw.config.lpVersion)) versions.push(ver);
		});
		versions.sort(function(a, b){
			return semver.lt(a, b) ? -1 : 1;
		});
		for(var i=versions.length; i>0; i--) {
			if(semver.gte(fromVer, versions[i-1])) break;
		}
		async.eachSeries(versions.slice(i), function(ver, cb){
			require('../upgrade/' + ver + '.js')(app, function(err){
				if(err) return cb(err);
				stepCb(ver, cb);
			});
		}, cb);
	});
};

var upgradeSite = function(app, cb){
	var abort = function(){
		console.log('Upgrade site failed. Abort.');
		setTimeout(function(){
			app.stop();
		}, 5000);
	};
	dbSettings.get('lightpalette', function(err, version){
		if(!version) {
			dbSettings.set('lightpalette', fw.config.lpVersion, function(err){
				if(err) return abort();
				cb();
			});
			return;
		}
		if(semver.lt(version, fw.config.lpVersion)) {
			upgradeVersions(app, version, function(ver, next){
				dbSettings.set('lightpalette', ver, function(err){
					if(err) return abort();
					next();
				});
			}, function(err){
				if(err) return abort();
				dbSettings.set('lightpalette', fw.config.lpVersion, function(err){
					if(err) return abort();
					cb();
				});
			});
		} else {
			cb();
		}
	});
};

module.exports = function(app, cb){
	upgradeSite(app, function(){
		cb();
	});
};
