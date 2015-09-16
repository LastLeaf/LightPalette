// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var fse = require('fs-extra');
var async = require('async');

var User = fw.module('/db_model').User;

var exports = module.exports = function(conn, res, args){
	User.checkPermission(conn, 'admin', function(perm){
		if(!perm) return res.err('noPermission');
		res.next();
	});
};

exports.list = function(conn, res){
	// read site list
	var sitesDir = conn.app.config.app.siteRoot + '/xbackup/';
	fs.readdir(sitesDir, function(err, files){
		if(err) return res.err('system');
		var sites = files.sort();
		// list available backup files
		var details = [];
		var local = null;
		async.eachSeries(sites, function(site, cb){
			var siteDir = sitesDir + site;
			if(site !== 'local' && site.slice(-5) !== '.site') return cb();
			fs.readdir(siteDir, function(err, files){
				if(err) return cb('system');
				var zips = [];
				for(var i=0; i<files.length; i++) {
					var match = files[i].match(/^(.*?)\.xbackup\.zip(\.enc|)$/);
					if(match) {
						var ft = match[1].replace(/^([0-9]+)-([0-9]+)-([0-9]+)_([0-9]+)-([0-9]+)-([0-9]+)/, function(m, m1, m2, m3, m4, m5, m6){
							return m1 + '-' + m2 + '-' + m3 + ' ' + m4 + ':' + m5 + ':' + m6;
						});
						zips.push({
							file: files[i],
							timeString: ft
						});
					}
				}
				if(site === 'local') {
					local = zips;
				} else details.push({
					domain: site.slice(0, -5),
					files: zips
				});
				cb();
			});
		}, function(err){
			if(err) return res.err('system');
			res({
				local: local,
				sites: details
			});
		});
	});
};

exports.modify = function(conn, res, args){
	var addSites = String(args.add).match(/\S+/g) || [];
	var removeSites = String(args.remove).match(/\S+/g) || [];
	async.eachSeries(removeSites, function(site, cb){
		var dir = conn.app.config.app.siteRoot + '/xbackup/' + site + '.site';
		fse.remove(dir, function(){
			cb();
		});
	}, function(){
		async.eachSeries(addSites, function(site, cb){
			var dir = conn.app.config.app.siteRoot + '/xbackup/' + site + '.site';
			fs.mkdir(dir, function(){
				cb();
			});
		}, function(){
			res();
		});
	});
};
