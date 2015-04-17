// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('form_filter');
var Post = fw.module('db_model').Post;
var Stat = fw.module('db_model').Stat;
var User = fw.module('db_model').User;
var Series = fw.module('db_model').Series;
var Category = fw.module('db_model').Category;
var Comment = fw.module('db_model').Comment;
var Settings = fw.module('db_model').Settings;
var preservedPath = fw.module('preserved_path.js');
var dateString = fw.module('date_string.js');
var driver = fw.module('driver.js');

// create a new post and return its id
exports.create = function(conn, res, args){
	args = formFilter(args, {
		type: ''
	});
	if(!args.type) return res.err('system');
	if(!driver.get(args.type)) return res.err('system');
	User.checkPermission(conn, ['contributor', 'writer', 'editor', 'admin'], function(contributor, writer, editor, admin){
		if(!contributor) return res.err('noPermission');
		var postArgs = {
			type: args.type,
			author: conn.session.userId,
			time: Math.floor(new Date().getTime() / 1000),
			driver: {}
		};
		var writePermission = driver.get(args.type).writePermission;
		if(typeof(writePermission) === 'function') {
			writePermission = writePermission(postArgs);
		}
		if(writePermission === 'admin' && !admin) return res.err('noPermission');
		if(writePermission === 'editor' && !editor) return res.err('noPermission');
		if(writePermission === 'writer' && !writer) return res.err('noPermission');
		new Post(postArgs).save(function(err, r){
			if(err) return res.err('system');
			res(r._id);
		});
	});
};

// modify a post
exports.modify = function(conn, res, args){
	var filtered = formFilter(args, {
		_id: '',
		path: '',
		timeString: '',
		title: '',
		status: 'draft',
		author: conn.session.userId,
		category: [String, /\S([\S ]*\S)?/g],
		tag: [String, /\S([\S ]*\S)?/g],
		series: '',
		denyComment: '',
		content: '',
		abstract: ''
	});
	filtered.driver = args.driver || {};
	if(typeof(filtered.driver) !== 'object') res.err('system');
	filtered.acceptComment = !filtered.denyComment;
	if(filtered.timeString) {
		filtered.time = dateString.parse(filtered.timeString);
		if(typeof(filtered.time) !== 'number') return res.err('timeFormatIllegal');
	} else {
		filtered.time = new Date().getTime();
	}
	filtered.time = Math.floor(filtered.time / 1000);
	filtered.path = filtered.path.replace(/\/+/, '/');
	if(filtered.path.charAt(0) === '/') filtered.path = filtered.path.slice(1);
	delete filtered.timeString;
	args = filtered;
	User.checkPermission(conn, ['contributor', 'writer', 'editor', 'admin'], function(contributor, writer, editor, admin, userType){
		// check permission
		if(!contributor) return res.err('noPermission');
		if(!writer && (args.status !== 'draft' && args.status !== 'pending'))
			return res.err('noPermission');
		if(!editor && (args.status === 'special'))
			return res.err('noPermission');
		if(!writer && args.series)
			return res.err('noPermission');
		if(!editor && args.author !== conn.session.userId)
			return res.err('noPermission');
		// check path
		if(args.path.indexOf('?') >= 0) return res.err('pathUsed');
		if(preservedPath.check(args.path)) return res.err('pathUsed');
		var next = function(){
			// check category
			Category.find().where('_id').in(args.category).exec(function(err, r){
				if(err || r.length !== args.category.length) return res.err('system');
				// check id existence and author
				Post.findOne({_id: args._id}, function(err, r){
					if(err) return res.err('system');
					if(!editor && r.author !== conn.session.userId)
						return res.err('noPermission');
					var next = function(){
						// call driver's filter
						if(!driver.get(r.type)) return res.err('system');
						var writePermission = driver.get(r.type).writePermission;
						if(typeof(writePermission) === 'function') {
							writePermission = writePermission(args);
						}
						if(writePermission === 'admin' && !admin) return res.err('noPermission');
						if(writePermission === 'editor' && !editor) return res.err('noPermission');
						if(writePermission === 'writer' && !writer) return res.err('noPermission');
						driver.get(r.type).writeFilter(args, function(err){
							if(err) return res.err(err);
							// save
							var id = args._id;
							delete args._id;
							Post.update({_id: id}, args, function(err){
								if(err) return res.err('system');
								// update to series
								Series.update({_id: args.series}, {time: Math.floor(new Date().getTime() / 1000)}, function(){
									res();
								});
							});
						});
					};
					// check series
					if(!args.series || editor) {
						next();
					} else {
						Series.find({_id: args.series}).select('owner').exec(function(err, r){
							if(err) return res.err('system');
							if(r.owner !== conn.session.userId) return res.err('noPermission');
							next();
						});
					}
				});
			});
		};
		if((args.status === 'published' || args.status === 'visible' || args.status === 'special') && args.path) {
			Post.findOne({path: args.path}).or([{status: 'published'}, {status: 'visible'}, {status: 'special'}]).where('_id').ne(args._id).exec(function(err, r){
				if(err) return res.err('system');
				if(r) return res.err('pathUsed');
				next();
			});
		} else {
			next();
		}
	});
};

// remove a post
exports.remove = function(conn, res, args){
	var args = formFilter(args, {
		_id: '',
	});
	// validate
	User.checkPermission(conn, ['contributor', 'editor'], function(contributor, editor){
		// check permission
		if(!contributor) return res.err('noPermission');
		Post.findOne(args, function(err, r){
			if(err) return res.err('system');
			if(!editor && r.author !== conn.session.userId)
				return res.err('noPermission');
			Post.remove(args, function(err){
				if(err) return res.err('system');
				// remove related comment
				Comment.remove({post: args._id}).exec();
				Stat.remove({post: args._id}).exec();
				res();
			});
		});
	});
};

// get a post for editing
exports.get = function(conn, res, args){
	args = formFilter(args, {
		_id: '',
		originalTimeFormat: '',
	});
	User.checkPermission(conn, ['contributor', 'editor'], function(contributor, editor){
		if(!contributor) return res.err('noPermission');
		Post.findOne({_id: args._id})
			.populate('author', '_id displayName').populate('category', '_id title').populate('series', '_id title')
			.exec(function(err, r){
				if(err || !r) return res.err('notFound');
				if(!editor && r.author._id !== conn.session.userId)
					return res.err('noPermission');
				r = r.toObject();
				if(args.originalTimeFormat) {
					r.dateTimeString = dateString.dateTime(r.time*1000, '%F %T');
				} else {
					r.dateString = dateString.date(r.time*1000);
					r.dateTimeString = dateString.dateTime(r.time*1000);
				}
				if(!driver.get(r.type)) return res.err('system');
				driver.get(r.type).readEditFilter(r, function(err){
					if(err) return res.err('system');
					res(r);
				});
			});
	});
};

// get a post for reading
exports.read = function(conn, res, args){
	args = formFilter(args, {
		_id: '',
		path: ''
	});
	if(args._id) delete args.path;
	else delete args._id;
	Post.findOne(args).or([{status: 'published'}, {status: 'visible'}, {status: 'special'}]).where('time').lte(Math.floor(new Date().getTime() / 1000))
		.populate('author', '_id displayName').populate('category', '_id title').populate('series', '_id title')
		.exec(function(err, r){
			if(err || !r) return res.err('notFound');
			if(r.status !== 'published' && r.path !== args.path) return res.err('notFound');
			r = r.toObject();
			r.dateString = dateString.date(r.time*1000);
			r.dateTimeString = dateString.dateTime(r.time*1000);
			if(!driver.get(r.type)) return res.err('system');
			driver.get(r.type).readFilter(r, function(err){
				if(err) return res.err(err);
				res(r);
				// add to stat
				Settings.get('stat', function(err, statSettings){
					if(err || !statSettings || !statSettings.enabled) return;
					var time = Math.floor(new Date().getTime() / 1000);
					new Stat({post: r._id, time: time, sid: conn.session.id, ip: conn.ips.concat(conn.ip).join(' ') }).save();
					if(!conn.session.userAgent) {
						conn.session.userAgent = conn.headers['user-agent'];
						conn.session.save();
					}
				});
			});
		});
};

// get post list
exports.list = function(conn, res, args){
	args = formFilter(args, {
		search: '',
		title: '',
		series: '',
		category: '',
		tag: '',
		author: '',
		status: 'published',
		from: 0,
		count: 10
	});
	if(args.count > 20 || args.count < 1 || args.from < 0) return res.err('system');
	// add conditions
	if(args.search) {
		// text search for mongodb >= 2.6
		var query = Post.find({ $text: { $search: args.search, $language: 'none' } });
	} else {
		var query = Post.find({});
	}
	if(args.title) query = query.where('title').equals(args.title);
	if(args.series) query = query.where('series').equals(args.series);
	if(args.category) query = query.find({ category: args.category });
	if(args.tag) query = query.find({ tag: args.tag });
	if(args.author) query = query.where('author').equals(args.author);
	// run query and return
	var runQuery = function(){
		query.count(function(err, count){
			if(err) return res.err('system');
			query.find().select('_id path type title status author time category tag series abstract')
				.populate('author', '_id displayName').populate('category', '_id title').populate('series', '_id title')
				.sort('-time').skip(args.from).limit(args.count).exec(function(err, r){
					if(err) return res.err('system');
					for(var i=0; i<r.length; i++) {
						r[i] = r[i].toObject();
						r[i].dateString = dateString.date(r[i].time*1000);
						r[i].dateTimeString = dateString.dateTime(r[i].time*1000);
					}
					res({
						total: count,
						rows: r
					});
				});
		});
	};
	// permission to get other's draft
	if(args.status !== 'published') {
		User.checkPermission(conn, ['contributor', 'editor'], function(contributor, editor){
			if(!contributor) return res.err('noPermission');
			if(!editor && args.author !== conn.session.userId) return res.err('noPermission');
			if(args.status !== 'all') {
				var q = {status: args.status};
				if(args.author) q.author = args.author;
				query = query.where('status').equals(args.status);
				return runQuery();
			} else {
				var q = {};
				if(args.author) q.author = args.author;
				return runQuery();
			}
		});
	} else {
		query = query.where('status').equals('published').where('time').lte(Math.floor(new Date().getTime() / 1000));
		return runQuery();
	}
};
