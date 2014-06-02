// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('list.tmpl');

module.exports = function(conn, args, childRes, next){
	childRes.title = tmpl(conn).title({
		date: true,
		keyword: 'Jan 1, 2014'
	});
	childRes.content = tmpl(conn).index({
		date: true,
		keyword: 'Jan 1, 2014'
	});
	next(childRes);
};