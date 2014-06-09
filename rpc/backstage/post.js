// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('form_filter');
var Post = fw.module('db_model').Post;
var User = fw.module('db_model').User;
var drivers = fw.module('drivers');

// create a new post and return its id
exports.create = function(conn, res, args){
	args = formFilter(args, {
		type: ''
	});
	if(!args.type) return res.err('system');
	User.checkPermission(conn, 'contributor', function(r){
		if(!r) return res.err('noPermission');
		new Post({
			type: args.type,
			author: conn.session.userId,
			time: Math.floor(new Date().getTime() / 1000)
		}).save(function(err, r){
			if(err) return res.err('system');
			res(r._id);
		});
	});
};

// modify a post
exports.set = function(conn, res, args){
	var filtered = formFilter(args, {
		_id: '',
		path: '',
		title: '',
		status: 'draft',
		author: conn.session.userId,
		time: Math.floor(new Date().getTime() / 1000),
		category: '',
		tag: '',
		series: '',
		content: '',
		abstract: ''
	});
	filtered.driver = args.driver;
	args = filtered;
	// split categories and tags
	args.category = args.category.match(/\S([\S ]*\S)?/g);
	args.tag = args.tag.match(/\S([\S ]*\S)?/g);
	// validate
	if(args.time >= 2147483647) return res.err('system');
	User.checkPermission(conn, ['contributor', 'writer', 'editor'], function(contributor, writer, editor){
		// check permission
		if(!contributor) return res.err('noPermission');
		if(!writer && (args.status !== 'draft' && args.status !== 'pending'))
			return res.err('noPermission');
		if(!editor && args.author !== conn.session.userId)
			return res.err('noPermission');
		Post.findOne({_id: args._id}, function(err, r){
			if(err) return res.err('system');
			if(!editor && r.author !== conn.session.userId)
				return res.err('noPermission');
			// call driver's filter
			drivers[r.type].writeFilter(args, function(err){
				if(err) return res.err(err);
				// save
				var id = args._id;
				delete args._id;
				Post.update({_id: id}, args, function(err){
					if(err) return res.err('system');
					res();
				});
			});
		});
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
				res();
			});
		});
	});
};

// get a post for editing
exports.get = function(conn, res, args){
	args = formFilter(args, {
		_id: ''
	});
	User.checkPermission(conn, ['contributor', 'editor'], function(contributor, editor){
		if(!contributor) return res.err('noPermission');
		Post.findOne(args)
			.populate('author', '_id displayName').populate('category', '_id title').populate('series', '_id title')
			.exec(function(err, r){
				if(err || !r) return res.err(err);
				if(!editor && r.author !== conn.session.userId)
					return res.err('noPermission');
				drivers[r.type].readFilter(r, function(err){
					if(err) return res.err(err);
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
	args.status = 'published';
	Post.findOne(args).where('time').lte(Math.floor(new Date().getTime() / 1000))
		.populate('author', '_id displayName').populate('category', '_id title').populate('series', '_id title')
		.exec(function(err, r){
			if(err || !r) return res.err('notFound');
			drivers[r.type].readFilter(r, function(err){
				if(err) return res.err(err);
				res(r);
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
	if(args.count > 20 || args.count < 1 || args.from < 0) return res.err('noPermission');
	// add conditions
	if(args.search) {
		// text search for mongodb >= 2.6
		var query = Post.find({ $text: { $search: args.search } });
	} else {
		var query = Post.find({});
	}
	if(args.title) query = query.where('title').equals(args.title);
	if(args.series) query = query.where('series').equals(args.series);
	if(args.category) query = query.find({ category: args.category });
	if(args.tag) query = query.find({ tag: args.tag });
	if(args.author) query = query.where('author').equals(args.author);
	// run query and return
	var total = null;
	var runQuery = function(){
		query.select('_id path type title status author time category tag series abstract')
			.populate('author', '_id displayName').populate('category', '_id title').populate('series', '_id title')
			.sort('-time').skip(args.from).limit(args.count).exec(function(err, r){
				if(err) return res.err('system');
				res({
					total: total,
					rows: r
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
				Post.count(q, function(err, r){
					if(err) return res.err('system');
					total = r;
					query = query.where('status').equals(args.status);
					runQuery();
				});
			} else {
				var q = {};
				if(args.author) q.author = args.author;
				Post.count(q, function(err, r){
					if(err) return res.err('system');
					total = r;
					runQuery();
				});
			}
		});
	} else {
		query = query.where('status').equals('published').where('time').lte(Math.floor(new Date().getTime() / 1000));
		runQuery();
	}
};