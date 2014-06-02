// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('list.tmpl');

module.exports = function(conn, args, childRes, next){
	childRes.title = tmpl(conn).title({
		series: true,
		keyword: 'A Long Story'
	});
	childRes.content = tmpl(conn).index({
		series: true,
		keyword: 'A Long Story'
	});
	next(childRes);
};