// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('list.tmpl');

module.exports = function(conn, args, childRes, next){
	childRes.title = tmpl(conn).title({
		author: true,
		keyword: 'LastLeaf'
	});
	childRes.content = tmpl(conn).index({
		author: true,
		keyword: 'LastLeaf'
	});
	next(childRes);
};