// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var stream = require('stream');
var eventEmitter = require('events').EventEmitter;
var mongodb = require('fw.mpa/node_modules/mongoose/node_modules/mongodb');

module.exports = function(args){
	var db = null;

	var createReadStream = function(colName){
		var cur = null;
		db.collection(colName, function(err, col){
			if(err) {
				ev.emit('error', new Error('Cannot read collection from database.'));
				return;
			}
			cur = col.find({}, { raw: true, snapshot: true });
		});
		var rs = new stream.Readable();
		rs._read = function(n) {
			if(!cur) return rs.push(null);
			cur.nextObject(function(err, item){
				if(err) {
					ev.emit('error', new Error('Cannot read collection from database.'));
					rs.push(null);
					rs = null;
					return;
				}
				if(!item) {
					rs.push(null);
					return;
				}
				rs.push(item);
			});
		};
		return rs;
	};

	var getCollections = function(cb){
		db.collectionNames(function(err, names){
			if(err) {
				ev.emit('error', new Error('Cannot list collections from database.'));
				db.close();
				db = null;
				return;
			}
			ev.nextCollection = function(){
				if(!names.length) {
					ev.emit('finish');
					db.close();
					db = null;
					return;
				}
				var name = names.shift().name;
				ev.emit('collection', name, function(){
					return createReadStream(name);
				});
			};
			cb();
		});
	};

	var connect = function(){
		db = new mongodb.Db(String(args.name), new mongodb.Server(String(args.host), Number(args.port)), {w: 1});
		db.open(function(err, db){
			if(err || !db) return ev.emit('error', new Error('Cannot connect to database.'));
			if(args.user) {
				db.authenticate(String(args.user), String(args.password), function(err, result){
					if(err || !result) {
						ev.emit('error', new Error('Database authentication failed.'));
						db.close();
						db = null;
						return;
					}
					getCollections(function(){
						ev.emit('connect');
					});
				});
			} else {
				getCollections(function(){
					ev.emit('connect');
				});
			}
		});
	};
	setTimeout(connect, 0);

	var ev = new eventEmitter();
	return ev;
};
