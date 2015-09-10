// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

module.exports = function(app, siteId, appconfig, cb){
	app.setConfig(appconfig);
	require('../../' + appconfig.app.siteRoot + '/app.js')(app, cb);
};
