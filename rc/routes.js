// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var path = require('path');

var site = fw.module('db_model').Site;

exports.global = {
	lib: [
		'/lib/crypto',
		{
			src: '/lib/jquery-1.11.1',
			userAgent: 'MSIE (6|7|8)\.'
		}, {
			src: '/lib/jquery-2.1.1',
			userAgent: '^.*(?!MSIE (6|7|8)\.)'
		}
	],
	main: 'global',
};

// frontstage
var frontstage = exports.forestage = {
	parent: 'global',
	lib: {
		src: [],
		minify: 'theme/min.js'
	},
	style: {
		src: [],
		minify: 'theme/min.css'
	},
	tmpl: {
		src: [],
		minify: 'theme/min.tmpl'
	},
	main: 'frontstage',
	render: 'frontstage',
	reload: 'both'
};

// get theme file list
if(fs.existsSync('client/theme')) {
	var files = fs.readdirSync('client/theme');
	for(var i=0; i<files.length; i++) {
		var file = files[i];
		var ext = path.extname(file);
		if(ext === '.js' && file.slice(-7) !== '.min.js') {
			if(file === 'main.js')
				frontstage.lib.src.push('theme/' + file);
			else
				frontstage.lib.src.unshift('theme/' + file);
		}
		if(ext === '.stylus' || (ext === '.css' && file.slice(-8) !== '.min.css')) {
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
