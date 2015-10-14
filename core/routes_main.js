// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

exports.global = {
	lib: ['/lib/crypto.min', 'lightpalette'],
	main: 'global',
};

exports.drivers = {
	parent: 'global'
};

exports.theme = {
	parent: 'drivers',
	render: 'theme',
	reload: 'both'
};

exports['*'] = {
	parent: 'theme',
	render: 'content',
};

exports['/feed'] = {
	page: 'feed'
};
