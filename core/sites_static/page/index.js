// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

module.exports = function(req, res){
	var reqPath = req.path;
	if(reqPath.slice(-1) === '/') reqPath = reqPath.slice(0, -1);
	var relPath = req.app.config.app.siteRoot + '/static' + req.path;
	fs.stat(relPath, function(err, stat){
		if(err || !stat || !stat.isDirectory()) {
			res.sendStatus(404);
			return;
		}
		// search for index.html
		relPath += '/index.html';
		fs.stat(relPath, function(err, stat){
			if(err || !stat || stat.isDirectory()) {
				res.sendStatus(403);
				return;
			}
			res.sendFile(reqPath + '/index.html', {root: req.app.config.app.siteRoot + '/static'});
		});
	});
};
