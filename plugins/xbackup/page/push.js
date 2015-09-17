// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var http = require('http');
var Buffer = require('buffer').Buffer;

var dateString = fw.module('/date_string.js');
var PluginSettings = fw.module('/db_model').PluginSettings;

var removeOldFiles = function(fileLimit, dir, filename){
	fs.readdir(dir, function(err, files){
		if(err) return;
		var list = [];
		for(var i=0; i<files.length; i++) {
			var file = files[i];
			var match = file.match(/^(.*?)\.xbackup\.zip(\.enc|)$/);
			if(match) {
				var ft = match[1].replace(/^([0-9]+)-([0-9]+)-([0-9]+)_([0-9]+)-([0-9]+)-([0-9]+)/, function(m, m1, m2, m3, m4, m5, m6){
					return m1 + '-' + m2 + '-' + m3 + ' ' + m4 + ':' + m5 + ':' + m6;
				});
				list.push({
					time: dateString.parse(ft) || 0,
					file: match[0]
				});
			}
		}
		list.sort(function(a, b){
			return a.time - b.time;
		});
		while(fileLimit && list.length > fileLimit) {
			var oldFile = list.shift().file;
			if(oldFile === filename) continue;
			fs.unlink(dir + '/' + oldFile);
		}
	});
};

var pullFile = function(app, site, file, expires, auth){
	var RETRIES = 5;
	var fetch = function(){
		var ws = fs.createWriteStream(app.config.app.siteRoot + '/xbackup/' + site + '.site/' + file);
		ws.on('error', function(){
			ws.end();
		});
		ws.on('open', function(){
			var req = http.get(
				'http://' + site
				+ '/plugins/xbackup/pull?site=' + encodeURIComponent(site)
				+ '&file=' + encodeURIComponent(file)
				+ '&expires=' + encodeURIComponent(expires)
				+ '&auth=' + encodeURIComponent(auth)
			, function(res){
				res.pipe(ws);
				res.on('end', function(){
					PluginSettings.get('xbackup', function(err, settings){
						var limit = settings.fileLimit;
						if(limit) removeOldFiles(limit, app.config.app.siteRoot + '/xbackup/' + site + '.site', file);
					});
				});
			});
			req.on('error', function(){
				req.abort();
				fs.unlink(app.config.app.siteRoot + '/xbackup/' + site + '.site/' + file);
				fetch();
			});
		});
	};
	fetch();
};

module.exports = function(req, res){
	var bufs = [];
	req.on('data', function(data){
		bufs.push(data);
	});
	req.on('end', function(){
		try {
			var metadata = JSON.parse(Buffer.concat(bufs).toString('utf8'));
		} catch(e) {
			res.sendStatus(403);
			return;
		}
		var site = String(metadata.site) || '';
		var file = String(metadata.file) || '';
		fs.stat(req.app.config.app.siteRoot + '/xbackup/' + site + '.site', function(err, stat){
			if(err || !stat || !stat.isDirectory()) {
				res.sendStatus(403);
				return;
			}
			res.sendStatus(200);
			pullFile(req.app, site, file, metadata.expires, metadata.auth);
		});
	});
};
