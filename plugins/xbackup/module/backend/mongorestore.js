// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var Buffer = require('buffer');
var stream = require('stream');
var eventEmitter = require('events').EventEmitter;
var mongodb = require('fw.mpa/node_modules/mongoose/node_modules/mongodb');
var BSON = mongodb.BSON;

module.exports = function(args){
	var db = null;

	var createWriteStream = function(colName){
		var col = null;
		var waitWrite = null;
		db.createCollection(colName, {w: 1}, function(err, c){
			if(err) {
				ev.emit('error', new Error('Cannot create collection in database.'));
				return;
			}
			col = c;
			if(waitWrite) {
				waitWrite();
				waitWrite = null;
			}
		});
		var ws = new stream.Writable();
		var bufsLen = 0;
		var bufs = [];
		ws._write = function(buf, encoding, next){

			// parse buf to bson items
			var parse = function(){
				bufsLen += buf.length;
				bufs.push(buf);
				// pending responses count
				var pending = 1;
				var pendingFunc = null;
				var pendingEnd = function(){
					pending--;
					if(!pending) next();
				};
				while(1) {
					// wait length
					if(bufsLen < 4) {
						pendingEnd();
						return;
					}
					while(bufs[0].length < 4) {
						var b0 = bufs.shift();
						var b1 = bufs.shift();
						bufs.unshift(Buffer.concat(b0, b1));
					}
					var len = bufs[0].readUInt32LE(0);
					if(bufsLen < len) {
						pendingEnd();
						return;
					}
					// slice
					var bufConcat = ( bufs.length > 1 ? Buffer.concat(bufs, bufsLen) : bufs[0] );
					var bufBson = bufConcat.slice(0, len);
					bufs = [bufConcat.slice(len)];
					bufsLen -= len;
					// write bson
					try {
						var obj = BSON.deserialize(bufBson);
					} catch(e) {
						ws.emit('error', new Error('Cannot parse documents.'));
						continue;
					}
					pending++;
					col.update({_id: obj._id}, obj, {upsert: true}, function(err){
						if(err) ws.emit('error', new Error('Cannot insert documents to database.'));
						pendingEnd();
					});
				}
			};

			if(col) parse();
			else waitWrite = parse;
		};
		return ws;
	};

	var getCollections = function(cb){
		db.collectionNames(function(err, list){
			list = list || [];
			var names = [];
			for(var i=0; i<list.length; i++) {
				names.push(list[i].name);
			}
			ev.dropCollection = function(name, cb){
				db.dropCollection(name, cb);
			};
			ev.collection = function(name){
				return createWriteStream(name);
			};
			ev.close = function(){
				db.close();
			};
			cb(names);
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
					getCollections(function(cols){
						ev.emit('connect', cols);
					});
				});
			} else {
				getCollections(cols, function(){
					ev.emit('connect', cols);
				});
			}
		});
	};
	setTimeout(connect, 0);

	var ev = new eventEmitter();
	return ev;
};
