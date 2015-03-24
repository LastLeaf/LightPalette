// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = {
	backstage: {
		parent: 'global',
		lib: [
			{
				src: '/lib/jquery-1.11.1',
				userAgent: 'MSIE (6|7|8)\\\.'
			}, {
				src: '/lib/jquery-2.1.1',
				userAgentNot: 'MSIE (6|7|8)\\\.'
			}, 'lib/table_builder'],
		main: 'main',
		tmpl: 'main',
		style: 'main.css',
	},
	drivers: {
		parent: 'backstage',
		main: 'drivers'
	},
	'./': {
		redirect: 'home',
	},
	'./*': {
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
	addons: {
		parent: 'backstage',
		main: 'addons',
		tmpl: 'addons',
		style: 'addons.css',
	},
	'./addons/': {
		redirect: 'addons/plugins'
	},
	'./addons/plugins': {
		parent: 'addons'
	},
	'./addons/themes': {
		parent: 'addons'
	},
	addonsSettings: {
		parent: 'backstage',
		main: 'addons_settings',
		tmpl: 'addons_settings',
		style: ['addons.css', 'settings.css']
	},
	'./addons/:type/:id': {
		redirect: 'addons'
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
		parent: 'theme',
		render: '/backstage/preview',
	}
};
