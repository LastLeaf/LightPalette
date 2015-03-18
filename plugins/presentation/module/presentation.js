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
	args.content = args.abstract = marked(String(args.driver.abstract));
	// convert content object to reveal.js structure
	var content = args.driver.content;
	if(!content || content.constructor !== Array) return cb('system');
	var s = '<div class="reveal" id="driver-presentation"><div class="slides" id="driver-presentation-slides">';
	for(var i=0; i<content.length; i++) {
		if(!content[i] || content[i].constructor === Array) {
			s += '<section>';
			for(var j=0; j<content[i].length; j++)
				s += '<section>' + marked(String(content[i][j])) + '</section>';
			s += '</section>';
		}
	}
	args.extra = s + '</div></div>';
	if(args.extra.length >= 65536) return cb('contentIllegal');
	if(args.abstract.length >= 4096) return cb('abstractIllegal');
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
	driver.set('presentation', handlers);
	cb();
};
