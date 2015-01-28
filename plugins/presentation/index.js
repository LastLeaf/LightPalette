// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, args, cb){
	app.bindDir('module', args.bindPath, args.pluginPath + '/module');
	app.bindDir('rpc', args.bindPath, args.pluginPath + '/rpc');
	app.bindDir('client', args.bindPath, args.pluginPath + '/client');
	app.route.add('drivers', {
		//lib: args.bindPath + '/lib/reveal.js/js/reveal.js',
		main: args.bindPath + '/main',
		tmpl: args.bindPath + '/main',
		style: args.bindPath + '/main'
	});
	app.route.add('backstage', 'drivers', {
		main: args.bindPath + '/backstage/main',
		tmpl: args.bindPath + '/backstage/main',
		style: args.bindPath + '/backstage/main'
	});
	cb();
};
