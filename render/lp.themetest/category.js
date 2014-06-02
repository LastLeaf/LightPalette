// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('list.tmpl');

module.exports = function(conn, args, childRes, next){
	childRes.title = tmpl(conn).title({
		category: true,
		keyword: 'Literature'
	});
	childRes.content = tmpl(conn).index({
		category: true,
		keyword: 'Literature'
	});
	next(childRes);
};