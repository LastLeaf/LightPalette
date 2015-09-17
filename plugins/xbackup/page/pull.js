// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var password = fw.module('/password.js');
var backupBackend = fw.module('/plugins/xbackup/backend');

var pullAuthCheck = function(app, site, file, expires, auth){
	return password.check(site+'|'+file+'|'+expires+'|'+app.config.secret.cookie, auth);
};

module.exports = function(req, res){
	if(Date.now() > Number(req.query.expires) || !pullAuthCheck(req.app, req.query.site, req.query.file, req.query.expires, req.query.auth)) {
		res.sendStatus(403);
		return;
	}
	res.sendFile(req.query.file, {root: req.app.config.app.siteRoot + '/xbackup/local'});
};
