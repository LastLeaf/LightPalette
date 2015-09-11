// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var User = fw.module('/db_model').User;
var PluginSettings = fw.module('/db_model').PluginSettings;
var backupBackend = fw.module('/plugins/xbackup/backend');

module.exports = function(conn, res, args){
	User.checkPermission(conn, 'admin', function(perm){
		if(!perm) return res.err('noPermission');
		res.next();
	});
};

exports.start = function(conn, res){};
exports.abort = function(conn, res){};
