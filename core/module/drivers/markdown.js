// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var marked = require('marked');
marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	smartypants: false
});

exports.writePermission = function(args){
	if(args.driver.enableHtml) return 'admin';
};

exports.writeFilter = function(args, cb){
	marked.setOptions({sanitize: !args.driver.enableHtml});
	args.abstract = marked(String(args.driver.abstract));
	args.content = marked(String(args.driver.content));
	cb();
};

exports.readEditFilter = function(args, cb){
	cb();
};

exports.readFilter = function(args, cb){
	delete args.driver;
	cb();
};
