// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var siteConfig = require('../config_app.js');

module.exports = function(app, cb){
	var exports = {};
	var siteApp = {};
	exports.start = function(siteInfo){
		var id = siteInfo._id;
		if(siteApp[id]) siteApp[id].destroy();
		siteConfig(app, siteInfo, function(config){
			siteApp[id] = fw.createApp(fw.config.lpCoreRoot + '/app.js', id, config);
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
