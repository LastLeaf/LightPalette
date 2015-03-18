// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var driver = fw.module('/driver.js');

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

var handlers = {};

handlers.writePermission = function(args){
	if(args.driver.enableHtml) return 'admin';
};

handlers.writeFilter = function(args, cb){
	marked.setOptions({sanitize: !args.driver.enableHtml});
	args.abstract = marked(String(args.driver.abstract));
	args.content = marked(String(args.driver.content));
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
	driver.set('markdown', handlers);
	cb();
};
