// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Settings = fw.module('db_model').Settings;
var User = fw.module('db_model').User;
var sitePathParser = fw.module('site_path_parser.js');

var tmpl = fw.tmpl('frontstage.tmpl');

module.exports = function(conn, args, childRes, next){
	User.findOne({_id: conn.session.userId}, function(err, userInfo){
		if(err || !userInfo) userInfo = {};
		var content = tmpl(conn).main({
			title: childRes.siteInfo.siteTitle,
			subtitle: childRes.siteInfo.siteSubtitle,
			copyright: childRes.siteInfo.siteCopyright,
			content: childRes.content,
			userInfo: userInfo
		});
		delete childRes.siteInfo;
		childRes.content = content;
		next(childRes);
	});
};