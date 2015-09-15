// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var fse = require('fs-extra');

module.exports = function(app, siteId, appconfig, cb){
	app.setConfig(appconfig);
	fse.ensureDir(appconfig.app.siteRoot + '/static', function(){
		app.bindDir('static', appconfig.app.siteRoot + '/static');
		app.bindDir('page', fw.config.lpCoreRoot + '/sites_static/page');
		app.route.set('*', {
			page: 'index'
		});
		app.start(cb);
	});
};
