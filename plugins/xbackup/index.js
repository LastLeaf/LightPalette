// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

var bindDirs = function(app, args, cb){
	app.bindDir('module', args.bindPath, args.pluginPath + '/module');
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
	cb();
};

module.exports = function(app, args, cb){
	fs.mkdir(app.config.app.siteRoot + '/xbackup', function(){
		bindDirs(app, args, cb);
	});
};
