// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var stream = require('stream');
var eventEmitter = require('events');
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
		var rs = new stream.Readable({
			read: function(n) {
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
			}
		});
		return rs;
	};

	var getCollections = function(){
		var cur = db.listCollections();
		ev.nextCollection = function(){
			cur.nextObject(function(err, item){
				if(err) {
					ev.emit('error', new Error('Cannot list collections from database.'));
					db.close();
					db = cur = null;
					return;
				}
				if(!item) {
					ev.emit('finish');
					db.close();
					db = cur = null;
					return;
				}
				var handled = false;
				ev.emit('collection', item.name, function(){
					return createReadStream(item.name);
				});
			});
		};
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
					ev.emit('connect', getCollections());
				});
			} else {
				ev.emit('connect', getCollections());
			}
		});
	};
	setTimeout(connect, 0);

	var ev = new eventEmitter();
	return ev;
};
