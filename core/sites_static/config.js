// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

// generate config
module.exports = function(app, siteInfo, cb){
	var id = siteInfo._id;
	var siteRoot = 'sites/' + id;
	var config = {
		app: {
			siteId: id,
			siteRoot: siteRoot,
			host: siteInfo.hosts,
			title: siteInfo.title,
			version: fw.config.lpVersion + '~' + String(Date.now())
		},
		client: {
			cache: siteRoot + '/cache'
		},
		db: {
			type: 'none'
		},
		secret: {
			cookie: siteInfo.secret || ''
		}
	};
	cb(config);
};
