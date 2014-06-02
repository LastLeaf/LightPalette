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
		author: '',
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

// get a post for editing
exports.get = function(conn, res, args){
	args = formFilter(args, {
		_id: ''
	});
	User.checkPermission(conn, ['contributor', 'editor'], function(contributor, editor){
		if(!contributor) return res.err('noPermission');
		Post.findOne(args, function(err, r){
			if(err || !r) return res.err('notFound');
			if(!editor && r.author !== conn.session.userId)
				return res.err('noPermission');
			drivers[r.type].readFilter(r, function(err){
				if(err) return res.err(err);
				r.category = r.category.join('\r\n');
				r.tag = r.tag.join('\r\n');
				res(r);
			});
		});
	});
};
