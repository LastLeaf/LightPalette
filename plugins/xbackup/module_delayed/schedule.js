// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var backupBackend = fw.module('/plugins/xbackup/backend');
var PluginSettings = fw.module('/db_model').PluginSettings;
var dateString = fw.module('/date_string.js');

var backupCheck = function(app){
	// check schedule settings
	PluginSettings.get('xbackup', function(err, settings){
		if(err || !settings || !settings.timed) return;
		// detect time
		var ts = Date.now();
		if(ts - settings.prevAutoBackTime <= 60000) return;
		var ds = dateString.dateTime(ts, '%w|%H|%M').split('|');
		if(Number(ds[0]) !== settings.day && settings.day !== -1) return;
		if(Number(ds[1]) !== settings.hour) return;
		if(Number(ds[2]) !== settings.minute) return;
		settings.prevAutoBackTime = ts;
		PluginSettings.set('xbackup', settings, function(err){
			if(err) return;
			backupBackend.start(settings);
		});
	});
};

module.exports = function(app, cb){
	var checkBackupTime = function(){
		if(app.destroyed) return;
		app.backupTimeoutObj = setTimeout(checkBackupTime, 10000);
		backupCheck();
	};

	if(app.backupTimeoutObj) clearTimeout(app.backupTimeoutObj);
	app.backupTimeoutObj = setTimeout(checkBackupTime, 0);
	cb(null);
};
