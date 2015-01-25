// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');
var formFilter = fw.module('form_filter');
var User = fw.module('db_model').User;

// create a category
exports.listPlugins = function(conn, res, args){
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		fs.readdir('plugins', function(err, globalPlugins){
			if(err) return res.err('system');
			fs.readdir(conn.app.config.app.siteRoot + '/plugins', function(err, sitePlugins){
				if(err) return res.err('system');
				var blocked = conn.app.config.app.enablePlugins;
				var enabledPlugins = conn.app.config.app.plugins;
				var availablePlugins = globalPlugins.concat(sitePlugins);
				// TODO
			});
		});
	});
};
