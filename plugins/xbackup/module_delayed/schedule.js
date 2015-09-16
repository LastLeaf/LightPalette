// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var backupBackend = fw.module('/plugins/xbackup/backend');

module.exports = function(app, cb){
	var checkBackupTime = function(){
		if(app.destroyed) return;
		app.backupTimeoutObj = setTimeout(checkBackupTime, 10000);

		// TODO
	};

	if(app.backupTimeoutObj) clearTimeout(app.backupTimeoutObj);
	app.backupTimeoutObj = setTimeout(checkBackupTime, 0);
	cb(null);
};
