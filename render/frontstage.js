// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Settings = fw.module('db_model').Settings;
var User = fw.module('db_model').User;
var Category = fw.module('db_model').Category;
var Post = fw.module('db_model').Post;
var sitePathParser = fw.module('site_path_parser.js');

var tmpl = fw.tmpl('frontstage.tmpl');

module.exports = function(conn, args, childRes, next){
	User.findOne({_id: conn.session.userId}, function(err, userInfo){
		if(err || !userInfo) userInfo = {};
		Category.find().select('_id title').sort('_id').exec(function(err, category){
			if(err || !category) category = [];
			Post.find({status: 'special'}).select('_id title').sort('time').exec(function(err, special){
				if(err || !special) special = {};
				var content = tmpl(conn).main({
					title: childRes.siteInfo.siteTitle,
					subtitle: childRes.siteInfo.siteSubtitle,
					copyright: childRes.siteInfo.siteCopyright,
					category: category,
					special: special,
					content: childRes.content,
					userInfo: userInfo
				});
				delete childRes.siteInfo;
				childRes.content = content;
				next(childRes);
			});
		});
	});
};