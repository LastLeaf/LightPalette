// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');
var zipStream = require('zip-stream');

var dateString = fw.module('/date_string.js');

module.exports = function(app, cb){
	// create target file
	var createStream = function(id, config, filename, file, log, cb){
		if(id !== processId) return cb('abort');
		file = fs.createWriteStream(app.config.app.siteRoot + '/xbackup/local/' + filename + '.temp');
		file.on('error', function(){
			log(id, 'Cannot write to backup file', filename);
			abort();
		});
		// TODO password
		cb(null, id, config, filename, file, log);
	};

	// create zip file
	var createZip = function(id, config, filename, file, log, cb){
		if(id !== processId) return cb('abort');
		var zip = new zipStream();
		zip.on('error', function(){
			log(id, 'Cannot compress file', 'zip failed');
			abort();
		});
		zip.pipe(file);
		cb(null, id, config, filename, zip, log);
	};

	// dump database collections
	var dumpDb = function(id, config, filename, zip, log, cb){
		if(id !== processId) return cb('abort');
		// TODO
		cb(null, id, config, filename, zip, log);
	};

	// copy files to zip
	var copyFiles = function(id, config, filename, zip, log, cb){
		if(id !== processId) return cb('abort');
		// TODO
		cb(null, id, config, filename, zip, log);
	};

	// remove old file
	var removeOldFiles = function(id, config, filename, zip, log, cb){
		if(id !== processId) return cb('abort');
		var dir = app.config.app.siteRoot + '/xbackup/local/';
		fs.readdir(dir, function(err, files){
			if(!err) {
				var list = [];
				for(var i=0; i<files.length; i++) {
					var file = files[i];
					if(file.match(/^([0-9]+)\.xbackup\.zip(\.enc|)\.temp$/)) {
						if(file !== filename + '.temp') {
							fs.unlink(app.config.app.siteRoot + '/xbackup/local/' + file);
						}
					} else {
						var match = file.match(/^([0-9]+)\.xbackup\.zip(\.enc|)$/);
						if(match) list.push({
							time: Number(match[1]),
							file: match[0]
						});
					}
				}
				list.sort(function(a, b){
					return a.time - b.time;
				});
				while(list.length >= config.fileLimit) {
					fs.unlink(app.config.app.siteRoot + '/xbackup/local/' + list.shift().file);
				}
			}
			cb(null, id, config, filename, zip, log);
		});
	};

	// remove old file
	var sendToSites = function(id, config, filename, zip, log, cb){
		if(id !== processId) return cb('done');
		// TODO
		cb(null, id, config, filename, zip, log);
	};

	// backup process
	var steps = [createStream, createZip, dumpDb, copyFiles, removeOldFiles, sendToSites];
	var processId = 0;
	var process = function(id, config){
		// logger
		var zipFile = Date.now() + '.xbackup.zip' + (config.password ? '.enc' : '');
		var logStream = fs.createWriteStream(app.config.app.siteRoot + '/xbackup/backup.log');
		logStream.on('error', function(){
			abort();
		});
		var log = function(id, status, target){
			if(id !== processId) return false;
			logStream.write('[' + dateString.dateTime(Date.now()) + '] ' + status + ' : ' + target + '\n');
			return true;
		};
		logStream.on('open', function(){
			log(id, 'Backup started', zipFile);
			// start steps
			async.waterfall([function(cb){
				if(id !== processId) return cb('abort');
				cb(null, id, config, zipFile, null, log);
			}].concat(steps), function(err){
				if(err === 'abort') {
					fs.exists(app.config.app.siteRoot + '/xbackup/local/' + zipFile + '.temp', function(exists){
						if(exists) fs.unlink(app.config.app.siteRoot + '/xbackup/local/' + zipFile + '.temp');
					});
				} else {
					fs.rename(app.config.app.siteRoot + '/xbackup/local/' + zipFile + '.temp', app.config.app.siteRoot + '/xbackup/local/' + zipFile);
				}
				logStream.end();
				if(id === processId) processId = 0;
			});
		});
	};

	// API
	var start = function(config){
		if(processId) return false;
		processId = Date.now() + Math.random();
		setTimeout(function(){
			process(processId, config);
		}, 0);
		return true;
	};
	var abort = function(){
		if(!processId) return false;
		processId = 0;
		return true;
	};
	var log = function(cb){
		fs.readFile(app.config.app.siteRoot + '/xbackup/backup.log', {encoding: 'utf8'}, cb);
	};
	cb({
		isStarted: function(){ return !!processId; },
		start: start,
		abort: abort,
		log: log
	});
};
