// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, args, cb){
	app.bindDir('module', args.bindPath, args.pluginPath + '/module');
	app.bindDir('client', args.bindPath, args.pluginPath + '/client');
	app.route.add('backstage', 'drivers', {
		// TODO async loading tinymce
		lib: args.bindPath + '/lib/tinymce.js',
		main: args.bindPath + '/backstage/main',
		tmpl: args.bindPath + '/backstage/main',
		style: args.bindPath + '/backstage/main'
	});
	cb();
};
