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

// filter routes to make it safe
var filterRoutes = function(routes, addPrefix){
	var filteredRoutes = {};
	['main', 'lib', 'style', 'tmpl'].forEach(function(type){
		var arr = routes[type] || [];
		if(arr.constructor !== Array) arr = [arr];
		for(var i=0; i<arr.length; i++) {
			arr[i] = (addPrefix || '') + arr[i];
		}
		filteredRoutes[type] = arr;
	});
	return filteredRoutes;
};

var reconfig = function(app, cb){
	async.waterfall([function(cb){
		// clear bindings and routes
		app.clearBindings();
		app.route.clear();
		// set up core
		var dirs = [
			['client', '/', fw.config.lpCoreRoot + '/client'],
			['module', '/', fw.config.lpCoreRoot + '/module'],
			['module', '/', fw.config.lpCoreRoot + '/module_delayed'],
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
		app.loadedPlugins = {};
		if(!app.config.app.enablePlugins) return cb();
		async.eachSeries(app.config.app.plugins, function(pluginId, cb){
			var path = app.config.app.siteRoot + '/plugins/' + pluginId;
			async.waterfall([function(cb){
				fs.exists(path + '/plugin.json', cb);
			}, function(cb){
				path = 'plugins/' + pluginId;
				fs.exists(path + '/plugin.json', cb);
			}], function(exists){
				if(!exists) return cb();
				if(fw.debug) console.log('Loading plugin: ' + pluginId);
				fs.readFile(path + '/plugin.json', function(err, buf){
					// load and check config
					try {
						if(err) throw(err);
						var pluginConfig = JSON.parse(buf.toString('utf8'));
						if(pluginConfig.id && pluginConfig.id !== pluginId) {
							throw(new Error('Plugin is not placed at the right position.'));
						}
						if(!pluginConfig.lightpalette || !semver.satisfies(fw.config.lpVersion, pluginConfig.lightpalette.toString())) {
							throw(new Error('Plugin is not suitable for current version of LightPalette.'));
						}
						var pluginArgs = {
							plugin: pluginConfig,
							pluginId: pluginId,
							pluginPath: path,
							bindPath: '/plugins/' + pluginId
						};
						require(process.cwd() + '/' + path + '/index.js')(app, pluginArgs, function(){
							app.loadedPlugins[pluginId] = pluginConfig;
							app.loadedPlugins[pluginId].id = pluginId;
							// check if settings needed
							if(typeof(pluginConfig.settings) === 'object') {
								app.bindDir('client', '/backstage/addons/plugin/' + pluginId, path + '/settings');
								app.route.set('/backstage/addons/plugin', './' + pluginId, {
									parent: 'addonsSettings'
								});
								app.route.add('/backstage/addons/plugin', './' + pluginId, filterRoutes(pluginConfig.settings, pluginId + '/'));
								cb();
							} else {
								cb();
							}
						});
					} catch(err) {
						console.error('Loading plugin "' + pluginId + '" failed.');
						console.error(err.stack || 'Error: ' + err.message);
						if(fw.debug) process.exit();
						cb();
					}
				});
			});
		}, cb);
	}, function(cb){
		// loading theme
		var themeId = app.config.app.theme;
		if(!app.config.app.enableTheme) themeId = 'default';
		var path = app.config.app.siteRoot + '/themes/' + themeId;
		async.waterfall([function(cb){
			fs.exists(path + '/theme.json', cb);
		}, function(cb){
			path = 'themes/' + themeId;
			fs.exists(path + '/theme.json', cb);
		}, function(cb){
			themeId = 'default';
			path = 'themes/' + themeId;
			fs.exists(path + '/theme.json', cb);
		}], function(exists){
			if(!exists) throw(new Error('Theme files are not found.'));
			if(fw.debug) console.log('Loading theme: ' + themeId);
			fs.readFile(path + '/theme.json', function(err, buf){
				if(err) throw(err);
				// load and check config
				var themeConfig = JSON.parse(buf.toString('utf8'));
				if(themeConfig.id && themeConfig.id !== themeId) {
					throw(new Error('Theme is not placed at the right position.'));
				}
				if(!themeConfig.lightpalette || !semver.satisfies(fw.config.lpVersion, themeConfig.lightpalette.toString())) {
					throw(new Error('Theme is not suitable for current version of LightPalette.'));
				}
				// build routes
				var routes = themeConfig.routes;
				app.route.add('theme', filterRoutes(routes, 'theme/'));
				// bind dirs
				app.bindDir('client', '/theme', path + '/theme');
				async.waterfall([function(cb){
					fs.stat(path + '/drivers', function(err, stat){
						if(err || !stat.isDirectory()) return cb();
						app.bindDir('client', '/client/drivers', path + '/drivers');
						cb();
					});
				}, function(cb){
					// override render tmpls
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
				}, function(cb){
					// theming plugins
					fs.stat(path + '/plugins', function(err, stat){
						if(err || !stat.isDirectory()) return cb();
						// prevent js files in render
						fs.readdir(path + '/plugins', function(err, plugins){
							if(err) return cb();
							async.each(plugins, function(pluginId, cb){
								var pluginPath = path + '/plugins/' + pluginId;
								fs.stat(pluginPath, function(err, stat){
									if(err || !stat.isDirectory()) return cb();
									app.bindDir('client', '/plugins/' + pluginId, pluginPath);
									cb();
								});
							}, cb);
						});
					});
				}, function(cb){
					app.loadedTheme = themeConfig;
					app.loadedTheme.id = themeId;
					// check if settings needed
					if(typeof(themeConfig.settings) === 'object') {
						app.bindDir('client', '/backstage/addons/theme/' + themeId, path + '/settings');
						app.route.set('/backstage/addons/theme', './' + themeId, {
							parent: 'addonsSettings'
						});
						app.route.add('/backstage/addons/theme', './' + themeId, filterRoutes(themeConfig.settings, themeId + '/'));
						cb();
					} else {
						cb();
					}
				}], cb);
			});
		});
	}, function(cb){
		// prepare dirs
		fs.exists(app.config.app.siteRoot + '/static', function(exists){
			if(exists) return cb();
			fs.mkdir(app.config.app.siteRoot + '/static', cb);
		});
	}], function(){
		app.start(cb);
	});
};

module.exports = function(app, siteId, appconfig, cb){
	app.setConfig(appconfig);
	app.restart = function(cb){
		app.stop(function(){
			reconfig(app, cb);
		});
	};
	reconfig(app, cb);
};
