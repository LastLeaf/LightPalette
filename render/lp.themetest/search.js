// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('list.tmpl');

module.exports = function(conn, args, childRes, next){
	childRes.title = tmpl(conn).title({
		search: true,
		keyword: 'Theme Test'
	});
	childRes.content = tmpl(conn).index({
		search: true,
		keyword: 'Theme Test'
	});
	next(childRes);
};