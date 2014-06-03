// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var path = require('path');

var site = fw.module('db_model').Site;

exports.global = {
	lib: ['/lib/crypto'],
	main: 'global',
};

// frontstage
var frontstage = exports.forestage = {
	parent: 'global',
	lib: {
		src: [],
		minify: 'theme'
	},
	style: {
		src: [],
		minify: 'theme'
	},
	tmpl: {
		src: [],
		minify: 'theme'
	},
	main: 'frontstage',
	render: 'frontstage',
	reload: 'in'
};

// get theme file list
var files = fs.readdirSync('client/theme');
for(var i=0; i<files.length; i++) {
	var file = files[i];
	var ext = path.extname(file);
	if(ext === '.js') {
		if(file === 'main.js')
			frontstage.lib.src.push('theme/' + file);
		else
			frontstage.lib.src.unshift('theme/' + file);
	}
	if(ext === '.css') {
		if(file === 'main.css' || file === 'main.stylus')
			frontstage.style.src.push('theme/' + file);
		else
			frontstage.style.src.unshift('theme/' + file);
	}
	if(ext === '.tmpl') {
		if(file === 'main.tmpl')
			frontstage.tmpl.src.push('theme/' + file);
		else
			frontstage.tmpl.src.unshift('theme/' + file);
	}
}
if(!frontstage.lib.src.length)
	delete frontstage.lib;
if(!frontstage.style.src.length)
	delete frontstage.style;
if(!frontstage.tmpl.src.length)
	delete frontstage.tmpl;

exports['*'] = {
	parent: 'forestage',
	render: 'index',
};
