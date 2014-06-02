// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var xss = require('xss');
var ent = require('ent');

exports.writeFilter = function(args, cb){
	args.content = xss(args.content);
	if(args.driver.abstractType === 'manualText')
		args.abstract = ent.encode(args.driver.abstract);
	else
		args.abstract = args.driver.abstract = xss(args.driver.abstract);
	args.driver = {
		abstractType: args.driver.abstractType,
		abstract: args.driver.abstract
	};
	cb();
};

exports.readFilter = function(args, cb){
	cb();
};