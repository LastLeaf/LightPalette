// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

var siteConfig = require('../config_app.js');

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
		siteConfig(app, siteInfo, function(config){
			ensureSiteRoot(config.app.siteRoot, function(exists){
				siteApp[id] = fw.createApp(fw.config.lpCoreRoot + '/app.js', id, config, cb);
			});
		});
	};
	exports.stop = function(id){
		if(!siteApp[id]) return;
		var app = siteApp[id];
		delete siteApp[id];
		app.destroy();
	};
	cb(exports);
};
