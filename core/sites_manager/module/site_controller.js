// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

var configBlog = require('../../config.js');
var configStatic = require('../../sites_static/config.js');
var configFwApp = require('../../sites_fwapp/config.js');

var ensureSiteRoot = function(siteRoot, cb){
	fs.exists(siteRoot, function(exists){
		if(exists) return cb();
		fs.exists('sites', function(exists){
			if(exists) return fs.mkdir(siteRoot, cb);
			fs.mkdir('sites', function(){
				fs.mkdir(siteRoot, cb);
			});
		});
	});
};

module.exports = function(app, cb){
	var exports = {};
	var siteApp = {};
	exports.start = function(siteInfo, cb){
		var id = siteInfo._id;
		if(siteApp[id]) siteApp[id].destroy();
		if(siteInfo.type === 'static') {
			// static files
			configStatic(app, siteInfo, function(config){
				ensureSiteRoot(config.app.siteRoot, function(exists){
					siteApp[id] = fw.createApp(fw.config.lpCoreRoot + '/sites_static/app.js', id, config, cb);
				});
			});
		} else if(siteInfo.type === 'fwapp') {
			// fw.mpa app
			configFwApp(app, siteInfo, function(config){
				ensureSiteRoot(config.app.siteRoot, function(exists){
					siteApp[id] = fw.createApp(fw.config.lpCoreRoot + '/sites_fwapp/app.js', id, config, cb);
				});
			});
		} else {
			// common blog
			configBlog(app, siteInfo, function(config){
				ensureSiteRoot(config.app.siteRoot, function(exists){
					siteApp[id] = fw.createApp(fw.config.lpCoreRoot + '/app.js', id, config, cb);
				});
			});
		}
	};
	exports.stop = function(id){
		if(!siteApp[id]) return;
		var app = siteApp[id];
		delete siteApp[id];
		app.destroy();
	};
	cb(exports);
};
