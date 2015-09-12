// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var User = fw.module('/db_model').User;

module.exports = function(req, res){
	User.checkPermission(req.conn, 'admin', function(perm){
		if(!perm) return res.sendStatus(403);
		var file = req.path.slice('/plugins/xbackup/download/'.length);
		res.sendFile(file, {root: req.app.config.app.siteRoot + '/xbackup'});
	});
};
