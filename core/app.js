// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');
var semver = require('semver');

// loading appconfig and routes
var routes = require('./routes_main.js');
var backstageRoutes = require('./routes_backstage.js');

// walk file tree, call cb when meet a file
var walkFileTree = exports.walkFileTree = function(root, cb, doneCb, curPath){
	fs.readdir(root, function(err, files){
		if(err) return doneCb();
		var finishCount = files.length + 1;
		var finish = function(){
			if(!--finishCount) doneCb();
		};
		files.forEach(function(file){
			fs.stat(root + '/' + file, function(err, stat){
				if(err) return finish();
				if(stat.isDirectory()) walkFileTree(root + '/' + file, cb, finish, curPath ? curPath + '/' + file : file);
				else {
					cb(curPath ? curPath + '/' + file : file, stat);
					finish();
				}
			});
		});
		finish();
	});
};

module.exports = function(app, siteId, appconfig){
	async.waterfall([function(cb){
		// set up core
		app.setConfig(appconfig);
		var dirs = [
			['client', '/', fw.config.lpCoreRoot + '/client'],
			['module', '/', fw.config.lpCoreRoot + '/module'],
			['page', '/', fw.config.lpCoreRoot + '/page'],
			['render', '/', fw.config.lpCoreRoot + '/render'],
			['rpc', '/', fw.config.lpCoreRoot + '/rpc'],
			['static', '/', app.config.app.siteRoot + '/static']
		];
		dirs.forEach(function(dir, cb){
			app.bindDir.apply(app, dir.concat(cb));
		});
		app.route.setList(routes);
		app.route.setList('/backstage', backstageRoutes);
		cb();
	}, function(cb){
		// loading plugins
		fs.readdir('plugins', function(err, files){
			if(err) files = [];
			async.each(files, function(file, cb){
				var path = 'plugins/' + file;
				fs.readFile(path + '/plugin.json', function(err, buf){
					if(err) return cb();
					try {
						// load and check config
						var pluginConfig = JSON.parse(buf.toString('utf8'));
						if(!pluginConfig.lightpalette || !semver.satisfies(fw.config.lpVersion, pluginConfig.lightpalette.toString())) {
							throw(new Error('Plugin is not suitable for current version of LightPalette.'));
						}
						require(process.cwd() + '/' + path + '/index.js')(app, {plugin: pluginConfig, path: path}, cb);
					} catch(e) {
						console.error('Failed Loading Plugin: ' + file);
						console.log(e.stack);
						cb();
					}
				});
			}, cb);
		});
	}, function(cb){
		// loading theme
		var themeId = 'default';
		var path = 'themes/' + themeId;
		fs.readFile(path + '/theme.json', function(err, buf){
			try {
				// load and check config
				var themeConfig = JSON.parse(buf.toString('utf8'));
				if(!themeConfig.lightpalette || !semver.satisfies(fw.config.lpVersion, themeConfig.lightpalette.toString())) {
					throw(new Error('Theme is not suitable for current version of LightPalette.'));
				}
				// build routes
				var routes = themeConfig.routes;
				var filteredRoutes = {};
				['main', 'lib', 'style', 'tmpl'].forEach(function(type){
					var arr = routes[type] || [];
					if(arr.constructor !== Array) arr = [arr];
					for(var i=0; i<arr.length; i++) {
						arr[i] = 'theme/' + arr[i];
					}
					filteredRoutes[type] = arr;
				});
				app.route.add('theme', filteredRoutes);
				// bind dirs
				app.bindDir('client', '/theme', path + '/theme');
				async.waterfall([function(cb){
					fs.stat(path + '/drivers', function(err, stat){
						if(err || !stat.isDirectory()) return cb();
						app.bindDir('client', '/client/drivers', path + '/drivers');
						cb();
					});
				}, function(cb){
					fs.stat(path + '/render', function(err, stat){
						if(err || !stat.isDirectory()) return cb();
						// prevent js files in render
						var illegal = false;
						walkFileTree(path + '/render', function(file){
							if(file.slice(-3) === '.js') illegal = true;
						}, function(){
							if(illegal) {
								console.trace(new Error('JavaScript files are not allowed in render dir.'));
							} else {
								app.bindDir('render', '/', path + '/render');
							}
							cb();
						});
					});
				}], cb);
			} catch(e) {
				console.error('Failed Loading Theme: ' + themeId);
				console.log(e.stack);
				cb();
			}
		});
	}, function(cb){
		// prepare dirs
		fs.exists(app.config.app.siteRoot + '/static', function(exists){
			if(exists) return cb();
			fs.mkdir(app.config.app.siteRoot + '/static', cb);
		});
	}], function(){
		app.start();
	});
};
