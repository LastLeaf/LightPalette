// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('form_filter');
var User = fw.module('db_model').User;
var Post = fw.module('db_model').Post;
var Stat = fw.module('db_model').Stat;
var StatPath = fw.module('db_model').StatPath;
var StatReferer = fw.module('db_model').StatReferer;
var dateString = fw.module('date_string.js');

// get visiting history of a visitor
exports.visitor = function(conn, res, args){
	args = formFilter(args, {
		visitor: '',
		timeRange: 0,
		from: 0,
		count: 10
	});
	if(args.count > 20 || args.count < 1 || args.from < 0) return res.err('system');
	if(args.timeRange) var fromTime = Math.floor(new Date().getTime()/1000) - args.timeRange;
	else var fromTime = 0;
	// check permission
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		Stat.count({sid: args.visitor}).where('time').gt(fromTime).exec(function(err, total){
			if(err) return res.err('system');
			Stat.find({sid: args.visitor}).where('time').gt(fromTime).populate('post', '_id title').sort('-time').limit(args.count).skip(args.from).exec(function(err, r){
				if(err) return res.err('system');
				for(var i=0; i<r.length; i++) {
					r[i] = r[i].toObject();
					r[i].dateTimeString = dateString.dateTime(r[i].time*1000);
				}
				res({
					total: total,
					rows: r
				});
			});
		});
	});
};

// get visiting history of a post
exports.post = function(conn, res, args){
	args = formFilter(args, {
		post: '',
		timeRange: 0,
		from: 0,
		count: 10
	});
	if(args.count > 20 || args.count < 1 || args.from < 0) return res.err('system');
	if(args.timeRange) var fromTime = Math.floor(new Date().getTime()/1000) - args.timeRange;
	else var fromTime = 0;
	// check permission
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		Post.findOne({_id: args.post}).select('_id title type').exec(function(err, post){
			if(err) return res.err('system');
			Stat.count({post: args.post}).where('time').gt(fromTime).exec(function(err, visits){
				if(err) return res.err('system');
				Stat.aggregate()
					.match({ post: conn.app.db.Types.ObjectId(args.post), time: { $gt: fromTime } })
					.group({ _id: '$sid', visitsPerSid: { $sum: 1 } })
					.append()
					.group({ _id: null, count: { $sum: 1 } })
				.exec(function(err, r){
					if(err) return res.err('system', err);
					if(r.length) var visitors = r[0].count;
					else var visitors = 0;
					Stat.find({post: args.post}).where('time').gt(fromTime).sort('-time').limit(args.count).skip(args.from).exec(function(err, r){
						if(err) return res.err('system');
						for(var i=0; i<r.length; i++) {
							r[i] = r[i].toObject();
							r[i].dateTimeString = dateString.dateTime(r[i].time*1000);
						}
						res({
							post: post,
							visits: visits,
							visitors: visitors,
							rows: r
						});
					});
				});
			});
		});
	});
};

// get hot posts
exports.hotPosts = function(conn, res, args){
	args = formFilter(args, {
		timeRange: 0,
		count: 10
	});
	if(args.count > 20 || args.count < 1) return res.err('system');
	if(args.timeRange) var fromTime = Math.floor(new Date().getTime()/1000) - args.timeRange;
	else var fromTime = 0;
	// check permission
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		var query = Stat.aggregate();
		if(fromTime) query = query.match({ time: { $gt: fromTime } });
		query.group({ _id: '$post', visits: { $sum: 1 } })
			.project({ post: '$_id', visits: 1 })
			.sort('-visits')
			.limit(args.count);
		query.exec(function(err, r){
			if(err) return res.err('system');
			Stat.populate(r, {path: 'post', select: '_id title type author time'}, function(err, r){
				if(err) return res.err('system');
				User.populate(r, {path: 'post.author', select: '_id displayName'}, function(err, r){
					if(err) return res.err('system', err);
					for(var i=0; i<r.length; i++) {
						r[i].post = r[i].post.toObject();
						r[i].post.dateTimeString = dateString.dateTime(r[i].post.time*1000);
					}
					res({
						total: r.length,
						rows: r
					});
				});
			});
		});
	});
};

// get hot paths
exports.hotUrl = function(conn, res, args){
	args = formFilter(args, {
		timeRange: 0,
		count: 10
	});
	if(args.count > 20 || args.count < 1) return res.err('system');
	if(args.timeRange) var fromTime = Math.floor(new Date().getTime()/1000) - args.timeRange;
	else var fromTime = 0;
	// check permission
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		var query = StatPath.aggregate();
		if(fromTime) query = query.match({ time: { $gt: fromTime } });
		query.group({ _id: '$path', visits: { $sum: 1 } })
			.project({ path: '$_id', visits: 1 })
			.sort('-visits')
			.limit(args.count);
		query.exec(function(err, r){
			if(err) return res.err('system');
			res({
				total: r.length,
				rows: r
			});
		});
	});
};

// get hot ref sites
exports.hotRefSite = function(conn, res, args){
	args = formFilter(args, {
		timeRange: 0,
		count: 10
	});
	if(args.count > 20 || args.count < 1) return res.err('system');
	if(args.timeRange) var fromTime = Math.floor(new Date().getTime()/1000) - args.timeRange;
	else var fromTime = 0;
	// check permission
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		var query = StatReferer.aggregate();
		if(fromTime) query = query.match({ time: { $gt: fromTime } });
		query.group({ _id: '$refSite', visits: { $sum: 1 } })
			.project({ refSite: '$_id', visits: 1 })
			.sort('-visits')
			.limit(args.count);
		query.exec(function(err, r){
			if(err) return res.err('system');
			res({
				total: r.length,
				rows: r
			});
		});
	});
};

// clear history
exports.clear = function(conn, res, args){
	args = formFilter(args, {
		timeRange: 0
	});
	if(args.timeRange) var fromTime = Math.floor(new Date().getTime()/1000) - args.timeRange;
	else var fromTime = 0;
	// check permission
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		if(fromTime) var q = { time: { $lte: fromTime } };
		else var q = {};
		Stat.remove(q, function(){
			StatPath.remove(q, function(){
				StatReferer.remove(q, function(){
					res();
				});
			});
		});
	});
};
