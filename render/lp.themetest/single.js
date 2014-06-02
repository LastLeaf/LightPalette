// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('single.tmpl');

module.exports = function(conn, args, childRes, next){
	childRes.title = 'A Post';
	childRes.content = tmpl(conn).index();
	next(childRes);
};