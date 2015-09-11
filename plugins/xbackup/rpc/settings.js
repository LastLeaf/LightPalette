// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var User = fw.module('/db_model').User;
var PluginSettings = fw.module('/db_model').PluginSettings;

var defaultSettings = {
	timed: false,
	day: -1,
	hour: 3,
	minute: 30,
	fileLimit: 0,
	password: '',
	sendTo: '',
	dbBlacklist: [],
	fsBlacklist: []
};

var exports = module.exports = function(conn, res, args){
	User.checkPermission(conn, 'admin', function(perm){
		if(!perm) return res.err('noPermission');
		res.next();
	});
};

exports.setConfig = function(conn, res, args){};
exports.setDbBlacklist = function(conn, res, args){};
exports.setFsBlacklist = function(conn, res, args){};
exports.get = function(conn, res, args){};
