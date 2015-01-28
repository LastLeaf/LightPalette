// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Settings = fw.module('db_model').Settings;
var User = fw.module('db_model').User;
var Category = fw.module('db_model').Category;
var Post = fw.module('db_model').Post;

var tmpl = fw.tmpl('theme.tmpl');

module.exports = function(conn, args, childRes, next){
	User.findOne({_id: conn.session.userId}, function(err, userInfo){
		if(err || !userInfo) userInfo = {};
		Category.find().select('_id title').sort('_id').exec(function(err, category){
			if(err || !category) category = [];
			Post.find({status: 'special'}).select('_id path title').sort('time').exec(function(err, special){
				if(err || !special) special = {};
				var data = {
					siteInfo: childRes.siteInfo,
					themeSettings: childRes.themeSettings,
					title: childRes.siteInfo.siteTitle,
					subtitle: childRes.siteInfo.siteSubtitle,
					copyright: childRes.siteInfo.siteCopyright,
					category: category,
					special: special,
					content: childRes.content,
					userInfo: userInfo
				};
				var content = tmpl(conn).main(data);
				childRes.content = content;
				childRes.extraHead = tmpl(conn).extraHead(data);
				delete childRes.siteInfo;
				delete childRes.themeSettings;
				next(childRes);
			});
		});
	});
};
