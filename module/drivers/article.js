// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var sanitizeHtml = require('sanitize-html');

// filter
var styleFilter = function(tagName, attr){
	if(attr.style) {
		// filter style
		var m = attr.style.match(/(background-color|color|text-[-a-z]+)\s*:\s*[^:;]+/g);
		if(m) attr.style = m.join(';');
		else delete attr.style;
	}
	return {
		tagName: tagName,
		attribs: attr
	};
};
var sanitizeOptions = {
	allowedTags: [ 'h1', 'h2', 'h3', 'img', 'blockquote', 'p', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'sup', 'sub', 'div', 'span' ],
	allowedAttributes: {
		a: [ 'href', 'title', 'target' ],
		img: [ 'src', 'alt', 'width', 'height' ],
		td: [ 'rowspan', 'colspan' ],
		p: [ 'style' ],
		span: [ 'style' ]
	},
	selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
	allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
	transformTags: {
		p: styleFilter,
		span: styleFilter
	}
};

exports.writeFilter = function(args, cb){
	args.content = sanitizeHtml(args.content, sanitizeOptions);
	if(args.driver.abstractType === 'manualText') {
		// generate abstract
		var s = String(args.driver.abstract).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r\n?/g, '\n').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
		args.abstract = '<p>' + s + '</p>';
	} else {
		args.abstract = args.driver.abstract = sanitizeHtml(args.driver.abstract || '', sanitizeOptions);
	}
	if(args.content.length >= 65536) return cb('contentIllegal');
	if(args.abstract.length >= 4096) return cb('abstractIllegal');
	args.driver = {
		abstractType: String(args.driver.abstractType),
		abstract: args.driver.abstract
	};
	cb();
};

exports.readEditFilter = function(args, cb){
	cb();
};

exports.readFilter = function(args, cb){
	delete args.driver;
	cb();
};