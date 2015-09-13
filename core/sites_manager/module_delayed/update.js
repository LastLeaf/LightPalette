// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var dbSettings = fw.module('db_settings.js');

module.exports = function(app, cb){
	if(!dbSettings) return cb();
	dbSettings.get('version', function(err, version){
		if(!version) {
			dbSettings.set('lightpalette', fw.config.lpVersion, cb);
			return;
		}
		// TODO: run update script
	});
};
