// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var crypto = require('crypto');
var async = require('async');
var zipStream = require('zip-stream');
var mongodump = require('./mongodump.js');

var dateString = fw.module('/date_string.js');
var pluginVersion = JSON.parse(fs.readFileSync(__dirname + '/../../plugin.json').toString('utf8')).version;

module.exports = function(app, cb){
	// create target file
	var createStream = function(id, config, filename, log, cb){
		if(id !== processId) return cb('abort');
		var file = fs.createWriteStream(app.config.app.siteRoot + '/xbackup/local/' + filename + '.temp');
		file.on('error', function(){
			log(id, 'Cannot write to backup file', filename);
			abort();
		});
		if(config.password) {
			var cryptoStream = crypto.createCipher('aes192', config.password);
			cryptoStream.pipe(file);
			file = cryptoStream;
		}
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
		cb(null, id, config, filename, zip, file, log);
	};

	// dump database collections
	var dumpDb = function(id, config, filename, zip, target, log, cb){
		if(id !== processId) return cb('abort');
		zip.entry(null, {name: 'db/'}, function(err, entry){
			var dump = mongodump(app.config.db);
			dump.once('error', function(err){
				zip.finish();
				log(id, 'Backup database failed', err.message);
				cb(err);
			});
			dump.on('collection', function(name, createReadStream){
				var prefix = app.config.db.prefix;
				if(id === processId && name.slice(0, prefix.length) === prefix && name.charAt(prefix.length) !== '~' && config.dbBlacklist.indexOf(name.slice(prefix.length)) < 0) {
					log(id, 'Dumping database', name.slice(prefix.length));
					zip.entry(createReadStream(), {name: 'db/' + name.slice(prefix.length) + '.bson'}, function(err, entry){
						dump.nextCollection();
					});
					return;
				}
				dump.nextCollection();
			});
			dump.once('connect', function(){
				dump.nextCollection();
			});
			dump.once('finish', function(){
				cb(null, id, config, filename, zip, target, log);
			});
		});
	};

	// copy files to zip
	var copyFiles = function(id, config, filename, zip, target, log, cb){
		if(id !== processId) return cb('abort');
		var listFiles = function(dir, rel, blacklist, fileCb, cb){
			fileCb(dir + '/', rel + '/', function(err){
				if(err) return cb( new Error('Failed reading directories.') );
				fs.readdir(dir, function(err, files){
					if(err) return cb( new Error('Failed reading directories.') );
					async.eachSeries(files, function(file, cb){
						if(blacklist.indexOf(file) >= 0) return cb();
						if(blacklist.length) log(id, 'Dumping filesystem', file);
						fs.stat(dir + '/' + file, function(err, stat){
							if(err) return cb( new Error('Failed reading files.') );
							if(stat.isDirectory()) {
								listFiles(dir + '/' + file, rel + '/' + file, [], fileCb, cb);
							} else if(stat.isFile()) {
								fileCb(dir + '/' + file, rel + '/' + file, cb);
							}
						});
					}, cb);
				});
			});
		};
		listFiles(app.config.app.siteRoot + '/static', 'fs', config.fsBlacklist, function(path, relPath, cb){
			var src = null;
			if(path.slice(-1) !== '/') {
				src = fs.createReadStream(path);
			}
			zip.entry(src, {name: relPath}, cb);
		}, function(err){
			if(err) {
				zip.finish();
				log(id, 'Backup filesystem failed', err.message);
				cb(err);
			}
			cb(null, id, config, filename, zip, target, log);
		});
	};

	// waiting write
	var waitingWriteStream = function(id, config, filename, zip, target, log, cb){
		target.on('finish', function(){
			fs.rename(app.config.app.siteRoot + '/xbackup/local/' + filename + '.temp', app.config.app.siteRoot + '/xbackup/local/' + filename, function(err){
				if(err) {
					log(id, 'Cannot find backup file', filename);
					abort();
					return;
				}
				cb(null, id, config, filename, log);
			});
		});
		var metadata = {
			xbackup: pluginVersion,
			lightpalette: fw.config.lpVersion
		};
		zip.entry(JSON.stringify(metadata), {name: 'xbackup.json'}, function(err, entry){});
		zip.finish();
	};

	// remove old file
	var removeOldFiles = function(id, config, filename, log, cb){
		if(id !== processId) return cb('abort');
		var dir = app.config.app.siteRoot + '/xbackup/local/';
		fs.readdir(dir, function(err, files){
			if(id !== processId) return cb('abort');
			if(!err) {
				var list = [];
				for(var i=0; i<files.length; i++) {
					var file = files[i];
					if(file.match(/^([0-9]+)\.xbackup\.zip(\.enc|)\.temp$/)) {
						fs.unlink(app.config.app.siteRoot + '/xbackup/local/' + file);
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
				while(config.fileLimit && list.length > config.fileLimit) {
					var oldFile = list.shift().file;
					fs.unlink(app.config.app.siteRoot + '/xbackup/local/' + oldFile);
					log(id, 'Removed old backup file', oldFile);
				}
			}
			cb(null, id, config, filename, log);
		});
	};

	// send to other sites
	var sendToSites = function(id, config, filename, log, cb){
		if(id !== processId) return cb('done');
		// TODO
		cb(null, id, config, filename, log);
	};

	// backup process
	var steps = [createStream, createZip, dumpDb, copyFiles, waitingWriteStream, removeOldFiles, sendToSites];
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
				cb(null, id, config, zipFile, log);
			}].concat(steps), function(err){
				if(err === 'abort') {
					fs.exists(app.config.app.siteRoot + '/xbackup/local/' + zipFile + '.temp', function(exists){
						if(exists) fs.unlink(app.config.app.siteRoot + '/xbackup/local/' + zipFile + '.temp');
					});
					log(id, 'Backup aborted', zipFile);
				} else {
					log(id, 'Backup finished', zipFile);
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
