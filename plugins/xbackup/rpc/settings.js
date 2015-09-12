// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');
var mongodb = require('fw.mpa/node_modules/mongoose/node_modules/mongodb');

var formFilter = fw.module('/form_filter.js');
var User = fw.module('/db_model').User;
var PluginSettings = fw.module('/db_model').PluginSettings;
var backupBackend = fw.module('/plugins/xbackup/backend');

var defaultSettings = {
	timed: false,
	day: -1,
	hour: 3,
	minute: 30,
	fileLimit: 0,
	password: '',
	sendTo: [],
	dbBlacklist: [
		'stats',
		'stat_referers',
		'stat_paths'
	],
	fsBlacklist: []
};

var exports = module.exports = function(conn, res, args){
	User.checkPermission(conn, 'admin', function(perm){
		if(!perm) return res.err('noPermission');
		res.next();
	});
};

exports.get = function(conn, res, args){
	var siteInfo = conn.app.config.app;
	var data = {
		config: null,
		db: null,
		fs: null
	};
	async.parallel([function(cb){
		PluginSettings.get('xbackup', function(err, settings){
			if(err || !settings) settings = defaultSettings;
			data.config = settings;
			cb();
		});
	}, function(cb){
		var args = conn.app.config.db;
		var db = new mongodb.Db(String(args.name), new mongodb.Server(String(args.host), Number(args.port)), {w: 1});
		db.open(function(err, db){
			if(err || !db) return cb('system');
			db.collectionNames(function(err, names){
				db.close();
				if(err) {
					cb('system');
					return;
				}
				var prefix = conn.app.config.db.prefix;
				var cols = [];
				for(var i=0; i<names.length; i++) {
					var name = names[i].name;
					if(name.slice(0, prefix.length) === prefix && name.charAt(prefix.length) !== '~') {
						cols.push(name.slice(prefix.length));
					}
				}
				data.db = cols;
				cb();
			});
		});
	}, function(cb){
		fs.readdir(siteInfo.siteRoot + '/static', function(err, files){
			if(err) return cb('system');
			var dirs = [];
			async.each(files, function(file, cb){
				fs.stat(siteInfo.siteRoot + '/static/' + file, function(err, stat){
					if(err || !stat.isDirectory()) return cb();
					dirs.push(file);
					cb();
				});
			}, function(){
				data.fs = dirs;
				cb();
			});
		});
	}], function(err){
		if(err) return res.err('system');
		res(data);
	});
};

exports.setConfig = function(conn, res, args){
	var args = formFilter(args, {
		timed: '',
		day: -1,
		hour: 3,
		minute: 30,
		fileLimit: 0,
		password: '',
		sendTo: ''
	});
	args.timed = !!args.timed;
	args.sendTo = args.sendTo.match(/\S+/g) || [];
	PluginSettings.get('xbackup', function(err, settings){
		if(err || !settings) settings = {};
		args.dbBlacklist = settings.dbBlacklist || defaultSettings.dbBlacklist;
		args.fsBlacklist = settings.fsBlacklist || defaultSettings.fsBlacklist;
		PluginSettings.set('xbackup', args, function(err){
			if(err) return res.err('system');
			res();
		});
	});
};

exports.setDbBlacklist = function(conn, res, args){
	if(typeof(args) !== 'object') return res.err('system');
	var blacklist = [];
	for(var k in args) {
		if(args[k]) blacklist.push(k);
	}
	PluginSettings.get('xbackup', function(err, settings){
		if(err || !settings) settings = JSON.parse(JSON.stringify(defaultSettings));
		settings.dbBlacklist = blacklist;
		PluginSettings.set('xbackup', settings, function(err){
			if(err) return res.err('system');
			res();
		});
	});
};

exports.setFsBlacklist = function(conn, res, args){
	if(typeof(args) !== 'object') return res.err('system');
	var blacklist = [];
	for(var k in args) {
		if(args[k]) blacklist.push(k);
	}
	PluginSettings.get('xbackup', function(err, settings){
		if(err || !settings) settings = JSON.parse(JSON.stringify(defaultSettings));
		settings.fsBlacklist = blacklist;
		PluginSettings.set('xbackup', settings, function(err){
			if(err) return res.err('system');
			res();
		});
	});
};

exports.startBackup = function(conn, res){
	PluginSettings.get('xbackup', function(err, settings){
		if(err || !settings) settings = defaultSettings();
		res(backupBackend.start(settings));
	});
};

exports.abortBackup = function(conn, res){
	res(backupBackend.abort());
};

exports.backupStatus = function(conn, res){
	var started = backupBackend.isStarted();
	backupBackend.log(function(err, log){
		res(started, log);
	});
};
