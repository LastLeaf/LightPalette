// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

var bindDirs = function(app, args, cb){
	app.bindDir('module', args.bindPath, args.pluginPath + '/module');
	app.bindDir('module', args.bindPath, args.pluginPath + '/module_delayed');
	app.bindDir('rpc', args.bindPath, args.pluginPath + '/rpc');
	app.bindDir('page', args.bindPath, args.pluginPath + '/page');
	app.route.set(args.bindPath + '/push', {
		base: args.bindPath,
		page: 'push'
	});
	app.route.set(args.bindPath + '/pull', {
		base: args.bindPath,
		page: 'pull'
	});
	app.route.set(args.bindPath + '/download/*', {
		base: args.bindPath,
		page: 'download'
	});
	cb();
};

module.exports = function(app, args, cb){
	fs.mkdir(app.config.app.siteRoot + '/xbackup', function(){
		fs.mkdir(app.config.app.siteRoot + '/xbackup/local', function(){
			bindDirs(app, args, cb);
		});
	});
};
