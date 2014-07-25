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

exports.writeFilter = function(args, cb){
	args.content = args.abstract = marked(escape(String(args.driver.abstract)));
	// convert content object to reveal.js structure
	var content = args.driver.content;
	if(!content || content.constructor !== Array) return cb('system');
	var s = '<div class="reveal" id="driver-presentation"><div class="slides">';
	for(var i=0; i<content.length; i++) {
		if(!content[i] || content[i].constructor === Array) {
			s += '<section>';
			for(var j=0; j<content[i].length; j++)
				s += '<section data-markdown><script type="text/template">' + String(content[i][j]) + '</script></section>';
			s += '</section>';
		}
	}
	args.extra = s + '</div></div>';
	if(args.extra.length >= 65536) return cb('contentIllegal');
	if(args.abstract.length >= 4096) return cb('abstractIllegal');
	cb();
};

exports.readEditFilter = function(args, cb){
	cb();
};

exports.readFilter = function(args, cb){
	delete args.driver;
	cb();
};
