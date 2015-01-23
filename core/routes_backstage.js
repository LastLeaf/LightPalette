// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var path = require('path');

// list drivers
var drivers = {
	parent: 'backstage',
	lib: [],
	main: ['drivers'],
	tmpl: [],
	style: []
};
var dirs = fs.readdirSync(fw.config.lpCoreRoot + '/client/backstage/drivers');
for(var i=dirs.length-1; i>=0; i--) {
	var dir = dirs[i];
	if(!fs.statSync(fw.config.lpCoreRoot + '/client/backstage/drivers/' + dir).isDirectory())
		continue;
	var files = fs.readdirSync(fw.config.lpCoreRoot + '/client/backstage/drivers/' + dir);
	for(var j=files.length-1; j>=0; j--) {
		var file = files[j];
		var ext = path.extname(file);
		if(ext === '.js' && file.slice(-7) !== '.min.js') {
			if(file === 'main.js')
				drivers.main.unshift('drivers/' + dir + '/' + file);
			else
				drivers.lib.unshift('drivers/' + dir + '/' + file);
		}
		if(ext === '.stylus' || (ext === '.css' && file.slice(-8) !== '.min.css')) {
			if(file === 'main.stylus' || file === 'main.css')
				drivers.style.push('drivers/' + dir + '/' + file);
			else
				drivers.style.unshift('drivers/' + dir + '/' + file);
		}
		if(ext === '.tmpl') {
			if(file === 'main.tmpl')
				drivers.tmpl.push('drivers/' + dir + '/' + file);
			else
				drivers.tmpl.unshift('drivers/' + dir + '/' + file);
		}
	}
}

// generate routes
module.exports = {
	backstage: {
		parent: 'global',
		lib: [
			{
				src: '/lib/jquery-1.11.1',
				userAgent: 'MSIE (6|7|8)\.'
			}, {
				src: '/lib/jquery-2.1.1',
				userAgent: '^.*(?!MSIE (6|7|8)\.)'
			}, {
				src: ['lib/table_builder', 'lib/driver_manager'],
				minify: 'libs'
			}],
		main: 'main',
		tmpl: 'main',
		style: 'main.css',
	},
	drivers: drivers,
	'./': {
		redirect: 'home',
	},
	'./home': {
		parent: 'backstage',
		main: 'home',
		tmpl: 'home',
		style: 'home.css',
	},
	'./stat': {
		redirect: './stat/hot'
	},
	'./stat/hot': {
		parent: 'backstage',
		main: 'stat_hot',
		tmpl: 'stat_hot',
		style: 'stat.css',
	},
	'./stat/post/:id': {
		parent: 'backstage',
		main: 'stat_post',
		tmpl: 'stat_post',
		style: 'stat.css',
	},
	'./stat/visitor/:id': {
		parent: 'backstage',
		main: 'stat_visitor',
		tmpl: 'stat_visitor',
		style: 'stat.css',
	},
	'./post': {
		parent: 'drivers',
		main: 'create',
		tmpl: 'create',
		style: 'create.css',
	},
	'./post/*': {
		parent: 'drivers',
		main: 'edit',
		tmpl: 'edit',
		style: 'edit.css',
	},
	'./posts': {
		parent: 'drivers',
		main: 'posts',
		tmpl: 'posts',
	},
	'./categories': {
		parent: 'backstage',
		main: 'categories',
		tmpl: 'categories',
	},
	'./series': {
		parent: 'backstage',
		main: 'series',
		tmpl: 'series',
	},
	'./comments': {
		parent: 'backstage',
		main: 'comments',
		tmpl: 'comments',
	},
	'./users': {
		parent: 'backstage',
		main: 'users',
		tmpl: 'users',
	},
	'./settings': {
		parent: 'backstage',
		main: 'settings',
		tmpl: 'settings',
		style: 'settings.css'
	},
	'./files': {
		parent: 'backstage',
		main: 'files',
		tmpl: 'files',
		style: 'files.css',
	},
	'./preview/*': {
		parent: 'forestage',
		render: '/backstage/preview',
	}
};
