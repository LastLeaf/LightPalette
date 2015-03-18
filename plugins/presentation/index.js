// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, args, cb){
	app.bindDir('module', args.bindPath, args.pluginPath + '/module');
	app.bindDir('rpc', args.bindPath, args.pluginPath + '/rpc');
	app.bindDir('client', args.bindPath, args.pluginPath + '/client');
	app.route.add('drivers', {
		subm: args.bindPath
	});
	app.route.add('backstage', 'drivers', {
		subm: args.bindPath + '/backstage'
	});
	cb();
};
