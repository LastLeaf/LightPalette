// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Settings = fw.module('db_model').Settings;
var sitePathParser = fw.module('site_path_parser.js');

var tmpl = fw.tmpl('frontstage.tmpl');

module.exports = function(conn, args, childRes, next){
	var content = tmpl(conn).main({
		title: childRes.siteInfo.siteTitle,
		subtitle: childRes.siteInfo.siteSubtitle,
		content: childRes.content,
	});
	delete childRes.siteInfo;
	childRes.content = content;
	next(childRes);
};