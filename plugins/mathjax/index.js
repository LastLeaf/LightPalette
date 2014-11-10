// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, args, cb){
	app.bindDir('client', args.path, args.path + '/client');
	app.route.add('theme', {
		lib: [ args.path + '/config', args.path + '/mathjax/MathJax' ],
		main:  args.path + '/main.js'
	});
	cb();
};
