// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, args, cb){
	app.bindDir('client', args.bindPath, args.pluginPath + '/client');
	app.route.add('global', {
		main: args.bindPath + '/gravatar.js'
	});
	cb();
};
