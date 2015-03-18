// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, args, cb){
	app.bindDir('module', args.bindPath, args.pluginPath + '/module');
	app.bindDir('rpc', '/backstage', args.pluginPath + '/backstage_rpc');
	app.bindDir('rpc', args.bindPath, args.pluginPath + '/rpc');
	cb();
};
