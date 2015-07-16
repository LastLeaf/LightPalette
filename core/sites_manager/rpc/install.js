// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var url = require('url');
var crypto = require('crypto');
var mongodb = require('fw.mpa/node_modules/mongoose/node_modules/mongodb');

// check install status
exports.checkStatus = function(conn, res, args){
	fs.exists('config.json', function(exists){
		if(exists) res('success');
		else res('checkSettings');
	});
};

// check db setting
exports.checkSettings = function(conn, res, args){
	fs.exists('config.json', function(exists){
		if(exists) return res.err('installed');
		// try connect mongodb
		if(!String(args.name) || !String(args.host) || !Number(args.port)) return res.err('dbNotConnected');
		var db = new mongodb.Db(String(args.name), new mongodb.Server(String(args.host), Number(args.port)), {w: 1});
		db.open(function(err, db) {
			if(err) return res.err('dbNotConnected');
			var createCol = function(){
				db.createCollection(String(args.prefix), {w: 1}, function(err){
					db.close();
					if(err) res.err('dbNotConnected');
					else success();
				});
			};
			if(args.user) {
				db.authenticate(String(args.user), String(args.password), function(err, result){
					if(err || !result) {
						res.err('dbNotConnected');
						db.close();
						return;
					}
					createCol();
				});
			} else {
				createCol();
			}
		});
		var success = function(){
			// generate settings object
			conn.session.settingsObj = {
				"ip":             fw.config.ip,
				"port":           fw.config.port,
				"dbHost":         String(args.host),
				"dbPort":         String(args.port),
				"dbName":         String(args.name),
				"dbUser":         String(args.user),
				"dbPassword":     String(args.password),
				"dbPrefix":       String(args.prefix),
				"secret":         crypto.randomBytes(48).toString('base64')
			};
			res('writeSettings');
		};
	});
};

// check write settings
exports.writeSettings = function(conn, res, args){
	fs.exists('config.json', function(exists){
		if(exists) return res.err('installed');
		if(!conn.session.settingsObj) return res('checkSettings');
		fs.writeFile('config.json', JSON.stringify(conn.session.settingsObj), function(err){
			if(err) res('writeManually', {text: JSON.stringify(conn.session.settingsObj, null, '  ')});
			else res('success');
		});
	});
};

// check install status
exports.writeManually = function(conn, res, args){
	fs.exists('config.json', function(exists){
		if(exists) res('success');
		else res.err('configFileNotFound');
	});
};
