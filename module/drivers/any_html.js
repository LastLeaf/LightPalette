// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

exports.writePermission = 'admin';

exports.writeFilter = function(args, cb){
	cb();
};

exports.readEditFilter = function(args, cb){
	cb();
};

exports.readFilter = function(args, cb){
	delete args.driver;
	cb();
};