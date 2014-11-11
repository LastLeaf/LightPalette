// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, args, cb){
	app.bindDir('rpc', args.path + '/rpc');
	cb();
};
