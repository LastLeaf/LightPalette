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
	args.abstract = marked(String(args.driver.abstract));
	// convert content object to reveal.js structure
	var content = args.driver.content;
	if(!content || content.constructor !== Array) return cb('system');
	var s = args.abstract + '<div class="reveal" id="driver-presentation"><div class="slides">';
	for(var i=0; i<content.length; i++) {
		if(content[i].constructor === Array) {
			s += '<section>';
			for(var j=0; i<content[i].length; j++)
				s += '<section data-markdown><script type="text/template">' + String(content[i]) + '</script></section>';
			s += '</section>';
		} else {
			s += '<section data-markdown><script type="text/template">' + String(content[i]) + '</script></section>';
		}
	}
	args.content = s + '</div></div>';
	if(args.content.length >= 65536) return cb('contentIllegal');
	if(args.abstract.length >= 4096) return cb('abstractIllegal');
	cb();
};

exports.readFilter = function(args, cb){
	cb();
};