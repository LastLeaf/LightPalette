// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, args, cb){
	app.bindDir('client', args.bindPath, args.pluginPath + '/client');
	app.route.add('theme', {
		lib: [ args.bindPath + '/config', args.bindPath + '/mathjax/MathJax' ],
		main: args.bindPath + '/main.js'
	});
	cb();
};
