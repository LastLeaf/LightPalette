// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var crypto = require('crypto');
var async = require('async');
var zipStream = require('zip-stream');
var mongodump = require('./mongodump.js');
var restoreProcess = require('./restore.js');

var dateString = fw.module('/date_string.js');
var PluginSettings = fw.module('/db_model').PluginSettings;

module.exports = function(app, cb){
	// set cross process id
	var setProcessId = function(id, cb){
		fs.writeFile(app.config.app.siteRoot + '/xbackup/xbackup.lock', id, cb);
	};
	var checkProcessId = function(id, cb){
		if(processId !== id) return cb(true);
		fs.readFile(app.config.app.siteRoot + '/xbackup/xbackup.lock', function(err, buf){
			if(err || buf.toString('utf8') !== String(id)) cb(true);
			else cb(false);
		});
	};

	// create target file
	var createStream = function(id, config, filename, log, cb){
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
		zip.entry(null, {name: 'db/'}, function(err, entry){
			if(err) {
				zip.finish();
				log(id, 'Backup database failed', 'Failed writing target file.');
				return;
			}
			var dump = mongodump(app.config.db);
			var readCollection = function(name, createReadStream){
				var prefix = app.config.db.prefix;
				if(name.slice(0, prefix.length) === prefix && name.charAt(prefix.length) !== '~' && config.dbBlacklist.indexOf(name.slice(prefix.length)) < 0) {
					log(id, 'Dumping database', name.slice(prefix.length));
					zip.entry(createReadStream(), {name: 'db/' + name.slice(prefix.length) + '.bson'}, function(err, entry){
						if(err) {
							zip.finish();
							log(id, 'Backup database failed', 'Failed writing target file.');
							cb('abort');
						}
						dump.nextCollection();
					});
					return;
				}
				dump.nextCollection();
			};
			dump.on('error', function(err){
				zip.finish();
				log(id, 'Backup database failed', err.message);
				cb('abort');
			});
			dump.on('collection', function(name, createReadStream){
				checkProcessId(id, function(err){
					if(err) return cb('abort');
					readCollection(name, createReadStream);
				});
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
		var listFiles = function(dir, rel, blacklist, fileCb, cb){
			fileCb(dir + '/', rel + '/', function(err){
				if(err) return cb( new Error('Failed reading directories.') );
				fs.readdir(dir, function(err, files){
					if(err) return cb( new Error('Failed reading directories.') );
					async.eachSeries(files, function(file, cb){
						if(blacklist && blacklist.indexOf(file) >= 0) return cb();
						if(blacklist) log(id, 'Dumping filesystem', file);
						fs.stat(dir + '/' + file, function(err, stat){
							if(err) return cb( new Error('Failed reading files.') );
							if(stat.isDirectory()) {
								listFiles(dir + '/' + file, rel + '/' + file, null, fileCb, cb);
							} else if(stat.isFile()) {
								fileCb(dir + '/' + file, rel + '/' + file, cb);
							}
						});
					}, cb);
				});
			});
		};
		var checkIdAndlistFiles = function(dir, rel, blacklist, fileCb, cb){
			checkProcessId(id, function(err){
				if(err) return cb('abort');
				listFiles(dir, rel, blacklist, fileCb, cb);
			});
		};
		checkIdAndlistFiles(app.config.app.siteRoot + '/static', 'fs', config.fsBlacklist, function(path, relPath, cb){
			var src = null;
			if(path.slice(-1) !== '/') {
				src = fs.createReadStream(path);
			}
			zip.entry(src, {name: relPath}, cb);
		}, function(err){
			if(err) {
				zip.finish();
				log(id, 'Backup filesystem failed', err.message);
				cb('abort');
				return;
			}
			cb(null, id, config, filename, zip, target, log);
		});
	};

	// waiting write
	var waitingWriteStream = function(id, config, filename, zip, target, log, cb){
		var metadata = {
			xbackup: pluginVersion,
			lightpalette: fw.config.lpVersion
		};
		var waitZip = function(err){
			if(err) {
				zip.finish();
				log(id, 'Failed writing metadata.', err.message);
				cb('abort');
				return;
			}
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
			zip.finish();
		};
		checkProcessId(id, function(err){
			if(err) return cb('abort');
			zip.entry(JSON.stringify(metadata), {name: 'xbackup.json'}, waitZip);
		});
	};

	// remove old file
	var removeOldFiles = function(id, config, filename, log, cb){
		var dir = app.config.app.siteRoot + '/xbackup/local/';
		var readdirCb = function(err, files){
			if(!err) {
				var list = [];
				for(var i=0; i<files.length; i++) {
					var file = files[i];
					if(file.match(/\.xbackup\.zip(\.enc|)\.temp$/)) {
						fs.unlink(app.config.app.siteRoot + '/xbackup/local/' + file);
					} else {
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
		};
		checkProcessId(id, function(err){
			if(err) return cb('abort');
			fs.readdir(dir, readdirCb);
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
	var restoring = false;
	var process = function(id, config){
		// logger
		var filePrefix = dateString.dateTime(Date.now(), '%Y-%m-%d_%H-%M-%S');
		var zipFile = filePrefix + '.xbackup.zip' + (config.password ? '.enc' : '');
		var logStream = fs.createWriteStream(app.config.app.siteRoot + '/xbackup/backup.log');
		logStream.on('error', function(){
			abort();
		});
		var log = function(id, status, target, cb){
			checkProcessId(id, function(err){
				if(!err) logStream.write('[' + dateString.dateTime(Date.now()) + '] ' + status + ' : ' + target + '\n');
				if(cb) cb();
			});
		};
		logStream.on('open', function(){
			log(id, 'Backup started', zipFile);
			// start steps
			async.waterfall([function(cb){
				checkProcessId(id, function(err){
					if(err) return cb('abort');
					cb(null, id, config, zipFile, log);
				});
			}].concat(steps), function(err){
				if(err === 'abort') {
					fs.exists(app.config.app.siteRoot + '/xbackup/local/' + zipFile + '.temp', function(exists){
						if(exists) fs.unlink(app.config.app.siteRoot + '/xbackup/local/' + zipFile + '.temp');
					});
					log(id, 'Backup aborted', zipFile, function(){ logStream.end(); });
				} else {
					log(id, 'Backup finished', zipFile, function(){ logStream.end(); });
				}
				if(id === processId) processId = 0;
			});
		});
	};

	// API
	var start = function(config){
		if(processId || restoring) return;
		processId = Date.now() + Math.random();
		setProcessId(processId, function(err){
			if(err) {
				processId = 0;
				return;
			}
			setTimeout(function(){
				process(processId, config);
			}, 0);
		});
	};
	var abort = function(){
		if(!processId || restoring) return;
		processId = 0;
	};
	var restore = function(app, file, password, remove){
		if(processId || restoring) return;
		restoring = true;
		restoreProcess(app, file, password, remove, pluginVersion, function(){
			restoring = false;
		});
	};
	var log = function(cb){
		fs.readFile(app.config.app.siteRoot + '/xbackup/backup.log', {encoding: 'utf8'}, cb);
	};

	// read version
	var pluginVersion = '';
	fs.readFile(__dirname + '/../../plugin.json', function(err, buf){
		pluginVersion = JSON.parse(buf.toString('utf8')).version;
		cb({
			isStarted: function(){ if(restoring) return null; return !!processId; },
			start: start,
			abort: abort,
			restore: restore,
			log: log
		});
	});
};
