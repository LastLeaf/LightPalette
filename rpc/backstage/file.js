// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var formFilter = fw.module('form_filter');
var User = fw.module('db_model').User;
var dateString = fw.module('date_string.js');

// rmdirp async
var rmdirp = function(path, cb) {
	fs.stat(path, function(err, stat){
		if(err) return cb(err);
		if(!stat.isDirectory())
			return fs.unlink(path, cb);
		fs.readdir(path, function(err, files){
			if(err) return cb(err);
			var c = files.length + 1;
			var finished = function(){
				if(--c) return;
				fs.rmdir(path, cb);
			};
			while(files.length)
				rmdirp(path + '/' + files.shift(), finished);
			finished();
		});
	});
};

// permission middleware
exports = module.exports = function(conn, res, args){
	if(!args || typeof(args.user) !== 'string' || typeof(args.path) !== 'string') return res.err('noPermission');
	var next = function(){
		if(args.path.charAt(0) !== '/') return res.err('notFound');
		if(args.path.slice(-1) !== '/') args.path += '/';
		args.serverPath = 'static/files/' + args.user + args.path;
		// create user folder if needed
		fs.exists('static/files/' + args.user, function(exists){
			if(exists)
				return res.next();
			fs.mkdir('static/files/' + args.user, function(err){
				if(err) return res.err('system');
				res.next();
			});
		});
	};
	User.checkPermission(conn, ['writer', 'editor'], function(writer, editor){
		if(!writer) return res.err('noPermission');
		if(args.user !== conn.session.userId) {
			if(!editor) return res.err('noPermission');
			User.findOne({_id: args.user}, function(err, r){
				if(err) return res.err('system');
				if(!r || User.typeLevel(r.type) < User.typeLevel('contributor'))
					return res.err('noPermission');
				next();
			});
		} else {
			next();
		}
	});
};

// create a new post and return its id
exports.createDir = function(conn, res, args){
	args = formFilter(args, {
		serverPath: '',
		name: ''
	});
	fs.mkdir(args.serverPath + args.name, function(err){
		if(err) return res.err('notFound');
		fs.stat(args.serverPath + args.name, function(err, stat){
			if(err) return res.err('system');
			res({
				name: args.name,
				dateTimeString: dateString.dateTime(dateString.parse(stat.mtime)),
				dir: stat.isDirectory()
			});
		});
	});
};

// rmdirp
exports.remove = function(conn, res, args){
	args = formFilter(args, {
		serverPath: '',
		name: ''
	});
	rmdirp(args.serverPath + args.name, function(err){
		if(err) return res.err('system');
		res();
	});
};

// create a new post and return its id
exports.list = function(conn, res, args){
	args = formFilter(args, {
		serverPath: '',
		from: 0,
		count: 0
	});
	if(args.from < 0 || args.count < 1 || args.count > 50) return res.err('system');
	fs.readdir(args.serverPath, function(err, r){
		if(err) return res.err('notFound');
		if(r.length < args.from) args.from = r.length;
		var rows = [];
		var next = function(){
			res({
				total: r.length,
				rows: rows
			});
		};
		var count = args.from + args.count;
		if(count > r.length - args.from) count = r.length - args.from;
		var c = count + 1;
		var finished = function(){
			c--;
			if(!c) next();
		};
		r = r.sort();
		for(var i=args.from; i < count; i++) (function(file){
			fs.stat(args.serverPath + file, function(err, stat){
				if(err) {
					finished();
					return;
				}
				rows.push({
					name: file,
					dateTimeString: dateString.dateTime(dateString.parse(stat.mtime)),
					dir: stat.isDirectory()
				});
				finished();
			});
		})(r[i]);
		finished();
	});
};
