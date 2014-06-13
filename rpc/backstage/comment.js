// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('form_filter');
var User = fw.module('db_model').User;
var Comment = fw.module('db_model').Comment;

// TODO

// create a series
exports.create = function(conn, res, args){
	args = formFilter(args, {
		user: '',
		email: '',
		acceptNotify: 'yes',
		url: '',
		content: '',
		description: ''
	});
	args.time = Math.floor(new Date().getTime() / 1000);
	User.checkPermission(conn, ['writer', 'editor'], function(writer, editor){
		if(!writer) return res.err('noPermission');
		if(!editor && args.owner !== conn.session.userId) return res.err('noPermission');
		new Series(args).save(function(err, r){
			if(err) return res.err('system');
			res();
		});
	});
};

// modify a series
exports.modify = function(conn, res, args){
	args = formFilter(args, {
		_id: '',
		title: '',
		owner: conn.session.userId,
		description: ''
	});
	User.checkPermission(conn, ['writer', 'editor'], function(writer, editor){
		if(!writer) return res.err('noPermission');
		if(!editor && args.owner !== conn.session.userId) return res.err('noPermission');
		var q = {_id: args._id};
		if(!editor) q.owner = conn.session.userId;
		Series.update(q, args, function(err, r){
			if(err || !r) return res.err('system');
			res();
		});
	});
};

// remove a series
exports.remove = function(conn, res, args){
	args = formFilter(args, {
		_id: '',
	});
	// validate
	User.checkPermission(conn, ['writer', 'editor'], function(writer, editor){
		if(!writer) return res.err('noPermission');
		var doRemove = function(){
			Post.update({series: args._id}, {series: ''}, {multi: true}, function(err){
				if(err) return res.err('system');
				Series.remove(args, function(err){
					if(err) return res.err('system');
					res();
				});
			});
		};
		if(editor) {
			doRemove();
		} else {
			Series.findOne(args).select('owner').exec(function(err, r){
				if(err || !r || r.owner !== conn.session.userId)
					return res.err('noPermission');
				doRemove();
			});
		}
	});
};

// get series list
exports.list = function(conn, res, args){
	args = formFilter(args, {
		from: 0,
		count: 10
	});
	if(args.count > 20 || args.count < 1 || args.from < 0) return res.err('noPermission');
	// validate
	User.checkPermission(conn, ['writer', 'editor'], function(writer, editor){
		if(!writer) return res.err('noPermission');
		// list all categories for editor, own categories for writer
		if(editor)
			var query = Series.find({});
		else
			var query = Series.find({ owner: { _id: conn.session.userId } });
		query.count(function(err, count){
			if(err) return res.err('system');
			query.find().select('_id title description owner').populate('owner').sort('-time').skip(args.from).limit(args.count).exec(function(err, r){
				if(err) return res.err('system');
				res({
					total: count,
					rows: r
				});
			});
		})
	});
};
