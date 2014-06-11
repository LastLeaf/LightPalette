// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('form_filter');
var User = fw.module('db_model').User;
var Category = fw.module('db_model').Category;
var Post = fw.module('db_model').Post;

// modify a category
exports.create = function(conn, res, args){
	var filtered = formFilter(args, {
		_id: '',
		title: '',
		description: ''
	});
	if(!args._id.match(/^[\S ]+$/)) return res.err('idIllegal');
	User.checkPermission(conn, 'editor', function(r){
		if(!r) return res.err('noPermission');
		new Category(args).save(function(err, r){
			if(err) return res.err('system');
			res();
		});
	});
};

// modify a category
exports.modify = function(conn, res, args){
	var filtered = formFilter(args, {
		_id: '',
		title: '',
		description: ''
	});
	User.checkPermission(conn, 'editor', function(r){
		if(!r) return res.err('noPermission');
		Category.update({_id: args._id}, args, function(err, r){
			if(err) return res.err('system');
			res();
		});
	});
};

// remove a post
exports.remove = function(conn, res, args){
	var args = formFilter(args, {
		_id: '',
	});
	// validate
	User.checkPermission(conn, 'editor', function(r){
		if(!r) return res.err('noPermission');
		Post.update({}, { $pull: { category: args._id } }, {multi: true}, function(err){
			if(err) return res.err('system');
			Category.remove(args, function(err){
				if(err) return res.err('system');
				res();
			});
		});
	});
};

// get post list
exports.list = function(conn, res, args){
	args = formFilter(args, {
		from: 0,
		count: 0
	});
	if(args.count < 0 || args.from < 0) return res.err('noPermission');
	if(args.count) {
		// get part of all categories
		Category.count(function(err, count){
			if(err) return res.err('system');
			Category.find({}).sort('_id').skip(args.from).limit(args.count).exec(function(err, r){
				if(err) return res.err('system');
				res({
					total: count,
					rows: r
				});
			});
		});
	} else {
		// list all categories
		Category.find({}).select('_id title').sort('_id').exec(function(err, r){
			if(err) return res.err('system');
			res(r);
		});
	}
};
