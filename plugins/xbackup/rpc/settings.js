// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');
var mongodb = require('fw.mpa/node_modules/mongoose/node_modules/mongodb');

var formFilter = fw.module('/form_filter.js');
var password = fw.module('/password.js');
var User = fw.module('/db_model').User;
var PluginSettings = fw.module('/db_model').PluginSettings;
var backupBackend = fw.module('/plugins/xbackup/backend');

var defaultSettings = function(){
	return {
		timed: false,
		day: -1,
		hour: 3,
		minute: 30,
		fileLimit: 0,
		password: '',
		sendTo: [],
		dbBlacklist: [
			'stats',
			'stats.referers',
			'stats.paths'
		],
		fsBlacklist: []
	};
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
		// get config
		PluginSettings.get('xbackup', function(err, settings){
			if(err || !settings) settings = defaultSettings();
			data.config = settings;
			cb();
		});
	}, function(cb){
		// list collections
		var args = conn.app.config.db;
		var db = new mongodb.Db(String(args.name), new mongodb.Server(String(args.host), Number(args.port)), {w: 1});
		var listCols = function(){
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
		};
		db.open(function(err, db){
			if(err || !db) return cb('system');
			if(args.user) {
				db.authenticate(String(args.user), String(args.password), function(err, result){
					if(err || !result) {
						cb('system');
						db.close();
						return;
					}
					listCols();
				});
			} else {
				listCols();
			}
		});
	}, function(cb){
		// list static
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
		args.dbBlacklist = settings.dbBlacklist || defaultSettings().dbBlacklist;
		args.fsBlacklist = settings.fsBlacklist || defaultSettings().fsBlacklist;
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
		if(err || !settings) settings = defaultSettings();
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
		if(err || !settings) settings = defaultSettings();
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
		backupBackend.start(settings);
		res();
	});
};

exports.abortBackup = function(conn, res){
	backupBackend.abort();
	res();
};

exports.backupStatus = function(conn, res){
	var started = backupBackend.isStarted();
	backupBackend.log(function(err, log){
		res(started, log);
	});
};

exports.restore = function(conn, res, args){
	var pwd = String(args.password);
	var path = String(args.path);
	var filePassword = String(args.filePassword);
	var remove = String(args.remove);
	User.findById(conn.session.userId).select('type password').exec(function(err, r){
		if(err) return res.err('system');
		if(!password.check(pwd, r.password)) return res.err('pwd');
		backupBackend.restore(conn.app, conn.app.config.app.siteRoot + '/static/files/' + path, filePassword, remove);
		res();
	});
};
