// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('index.tmpl');

module.exports = function(conn, args, childRes, next){
	childRes.title = 'LightPalette';
	childRes.content = tmpl(conn).index();
	next(childRes);
};