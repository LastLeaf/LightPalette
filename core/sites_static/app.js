// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

module.exports = function(app, siteId, appconfig, cb){
	app.setConfig(appconfig);
	app.bindDir('static', appconfig.app.siteRoot);
	app.bindDir('page', fw.config.lpCoreRoot + '/sites_static/page');
	app.route.set('*', {
		page: 'index'
	});
	app.start(cb);
};
