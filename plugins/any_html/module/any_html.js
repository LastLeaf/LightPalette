// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var driver = fw.module('/driver.js');

var handlers = {};

handlers.writePermission = 'admin';

handlers.writeFilter = function(args, cb){
	cb();
};

handlers.readEditFilter = function(args, cb){
	cb();
};

handlers.readFilter = function(args, cb){
	delete args.driver;
	cb();
};

module.exports = function(app, cb){
	driver.set('any_html', handlers);
	cb();
};
