// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var site = fw.module('db_model').Site;

exports.global = {
	lib: ['/lib/crypto.js'],
	main: 'global.js',
	style: 'global',
};

// common
exports.forestage = {
	parent: 'global',
	render: 'forestage',
};
exports['lp.search'] = {
	parent: 'forestage',
	main: 'search',
};
exports['lp.category'] = {
	parent: 'forestage',
	main: 'category',
};
exports['lp.tag'] = {
	parent: 'forestage',
	main: 'tag',
};
exports['lp.series'] = {
	parent: 'forestage',
	main: 'series',
};
exports['lp.author'] = {
	parent: 'forestage',
	main: 'author',
};
exports['lp.date'] = {
	parent: 'forestage',
	main: 'author',
};
exports['/'] = {
	parent: 'forestage',
	main: 'index',
	render: 'index',
};
exports['*'] = {
	redirect: '/'
};

if(fw.debug) {
	// themetest, no db required
	exports.themetest = {
		parent: 'global',
		main: 'theme/main',
		tmpl: 'theme/main',
		style: 'theme/main',
		render: 'lp.themetest/main',
	};
	exports['lp.themetest/single'] = {
		parent: 'themetest',
		main: 'theme/single',
		tmpl: 'theme/single',
		style: 'theme/single',
		render: 'lp.themetest/single',
	};
	exports['lp.themetest/'] = {
		parent: 'themetest',
		main: 'theme/list',
		tmpl: 'theme/list',
		style: 'theme/list',
		render: 'lp.themetest/index',
	};
	exports['lp.themetest/search'] = {
		parent: 'themetest',
		main: 'theme/list',
		tmpl: 'theme/list',
		style: 'theme/list',
		render: 'lp.themetest/search',
	};
	exports['lp.themetest/category'] = {
		parent: 'themetest',
		main: 'theme/list',
		tmpl: 'theme/list',
		style: 'theme/list',
		render: 'lp.themetest/category',
	};
	exports['lp.themetest/tag'] = {
		parent: 'themetest',
		main: 'theme/list',
		tmpl: 'theme/list',
		style: 'theme/list',
		render: 'lp.themetest/tag',
	};
	exports['lp.themetest/series'] = {
		parent: 'themetest',
		main: 'theme/list',
		tmpl: 'theme/list',
		style: 'theme/list',
		render: 'lp.themetest/series',
	};
	exports['lp.themetest/author'] = {
		parent: 'themetest',
		main: 'theme/list',
		tmpl: 'theme/list',
		style: 'theme/list',
		render: 'lp.themetest/author',
	};
	exports['lp.themetest/date'] = {
		parent: 'themetest',
		main: 'theme/list',
		tmpl: 'theme/list',
		style: 'theme/list',
		render: 'lp.themetest/date',
	};
}
