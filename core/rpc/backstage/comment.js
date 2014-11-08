// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var EMAIL_REGEXP = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\\\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

var formFilter = fw.module('form_filter');
var User = fw.module('db_model').User;
var Comment = fw.module('db_model').Comment;
var Post = fw.module('db_model').Post;
var Settings = fw.module('db_model').Settings;
var dateString = fw.module('date_string.js');
var password = fw.module('password');
var mail = fw.module('mail');

var tmpl = fw.tmpl('comment.tmpl');

var disablePath = function(id, email, cb){
	password.hash(id+'|'+email+'|'+fw.config.secret.cookie, function(err, r){
		cb(err, '/backstage/comment_notify/disable?i=' + id + '&e=' + encodeURIComponent(email) + '&s=' + encodeURIComponent(r));
	});
};

// disable reply
exports.disableNotify = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		_id: '',
		email: '',
		sign: '',
	});
	if(!args._id.match(/^[-\w]{4,32}$/i)) return res.err('usernameIllegal');
	if(args.email.length > 64 || !args.email.match(EMAIL_REGEXP)) return res.err('emailIllegal');
	if(!password.check(args._id+'|'+args.email+'|'+fw.config.secret.cookie, args.sign)) return res.err('system');
	Comment.update({_id: args._id, email: args.email}, {acceptNotify: false}, function(err){
		if(err) return res.err('system');
		res();
	});
};

// submit a comment
exports.create = function(conn, res, args){
	args = formFilter(args, {
		post: '',
		displayName: '',
		email: '',
		acceptNotify: '',
		url: '',
		content: '',
		responseTo: ''
	});
	args.time = Math.floor(new Date().getTime() / 1000);
	if(args.content.length <= 0 || args.content.length > 4096) return res.err('contentIllegal');
	args.acceptNotify = !!args.acceptNotify;
	if(args.responseTo === '') delete args.responseTo;
	// check post
	var next = function(){
		Post.findOne({_id: args.post}, function(err, r){
			if(err) return res.err('system');
			if(!r || !r.acceptComment || (r.status !== 'published' && r.status !== 'visible' && r.status !== 'special')) return res.err('noPermission');
			var postPath = '/' + (r.path || 'post/'+r._id);
			new Comment(args).save(function(err, comment){
				if(err) return res.err('system');
				if(args.responseTo) {
					// update response
					Comment.update({_id: args.responseTo, blocked: false}, { $push: {response: comment._id} }, function(err, r){
						if(err || !r) {
							Comment.remove({_id: comment._id}, function(err){
								res.err('notFound');
							});
							return;
						}
						res();
						// send notify mail
						if(!args.responseTo) return;
						Comment.findOne({_id: args.responseTo}, function(err, r){
							if(!r.acceptNotify || !r.email) return;
							var mailTo = r.email;
							var mailToName = r.displayName;
							Settings.get('basic', function(err, r){
								if(err || !r) return;
								var siteTitle = r.siteTitle;
								var host = r.siteHost;
								Settings.get('email', function(err, r){
									if(err || !r) return;
									var mailOptions = r;
									disablePath(args.responseTo, mailTo, function(err, r){
										var obj = {
											siteTitle: siteTitle,
											host: host || conn.host,
											comment: args,
											postPath: postPath,
											disablePath: r
										};
										mail(mailOptions, mailToName, mailTo, tmpl(conn).commentNotifyEmailTitle(obj), tmpl(conn).commentNotifyEmail(obj));
									});
								});
							});
						});
					});
					return;
				}
				res();
			});
		});
	};
	// apply user info
	if(conn.session.userId) {
		args.user = conn.session.userId;
		User.findOne({_id: args.user}, function(err, r){
			if(err) res.err('system');
			if(!r || r.type === 'disabled') res.err('noPermission');
			args.displayName = r.displayName;
			args.email = r.email;
			args.url = r.url;
			next();
		});
	} else {
		if(args.displayName.length <= 0 || args.displayName.length > 32) return res.err('usernameIllegal');
		if(args.email && (args.email.length > 64 || !args.email.match(EMAIL_REGEXP))) return res.err('emailIllegal');
		if(args.url && !args.url.match(/^https?:\/\//)) args.url = 'http://' + args.url;
		if(args.url.length > 1024) return res.err('urlIllegal');
		next();
	}
};

// block or unblock a comment
exports.block = function(conn, res, args){
	args = formFilter(args, {
		_id: '',
		blocked: ''
	});
	User.checkPermission(conn, 'editor', function(r){
		if(!r) return res.err('noPermission');
		args.blocked = !args.blocked;
		Comment.update(args, {blocked: !args.blocked}, function(err, changed){
			if(err) return res.err('notFound');
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
	User.checkPermission(conn, 'editor', function(r){
		if(!r) return res.err('noPermission');
		var doRemove = function(){
			Comment.remove(args, function(err){
				if(err) return res.err('system');
				res();
			});
		};
		Comment.findOne(args).select('response responseTo').exec(function(err, r){
			if(err || !r) return res.err('notFound');
			if(r.responseTo) {
				if(r.response && r.response.length) {
					// put children to the parent
					Comment.update({ _id: {$in: r.response} }, {responseTo: r.responseTo}, {multi: true}, function(err){
						// remove it from parent
						Comment.update({_id: r.responseTo}, { $pull: {response: args._id} }, function(err){
							// add children to parent
							Comment.update({_id: r.responseTo}, { $addToSet: { response: { $each: r.response } } }, function(err){
								doRemove();
							});
						});
					});
				} else {
					// remove it from parent
					Comment.update({_id: r.responseTo}, { $pull: {response: args._id} }, function(err){
						doRemove();
					});
				}
			} else {
				if(r.response) {
					// set children
					Comment.update({ _id: {$in: r.response} }, { $unset: { responseTo: '' } }, {multi: true}, function(){
						doRemove();
					});
				} else {
					doRemove();
				}
			}
		});
	});
};

// get series list
exports.list = function(conn, res, args){
	args = formFilter(args, {
		post: '',
		root: '*',
		depth: 0,
		desc: '',
		blocked: '',
		from: 0,
		count: 0
	});
	if(args.count > 50 || args.count < 0 || args.from < 0 || args.depth > 4 || args.depth < 0) return res.err('noPermission');
	if(!args.root && !args.post) return res.err('notFound');
	var doList = function(){
		// count
		var q = {};
		if(args.post) q.post = args.post;
		if(!args.blocked) q.blocked = false;
		Comment.count(q, function(err, count){
			if(err) return res.err('system');
			if(args.depth === 0) return res({
				total: count,
				rows: []
			});
			// root
			if(args.root === '*') {
				if(args.post)
					var query = Comment.find({ post: args.post });
				else
					var query = Comment.find().populate('post', '_id path title');
				query = query.select('time post user displayName email url content responseTo');
				var depth = 1;
			} else {
				if(args.root)
					var query = Comment.find({ _id: args.root, responseTo: null });
				else
					var query = Comment.find({ post: args.post, responseTo: null });
				query = query.select('time user displayName email url content response responseTo');
				var depth = args.depth;
			}
			// blocked
			if(!args.blocked) query = query.find({blocked: false});
			else query = query.select('blocked');
			// desc
			if(args.desc)
				query = query.sort('-time');
			else
				query = query.sort('time');
			// limit
			if(args.count)
				query = query.skip(args.from).limit(args.count);
			// recursive populate
			var populateOpt = {
				path: '',
				select: 'time user displayName email url content response responseTo'
			};
			if(!args.blocked) populateOpt.match = { blocked: false };
			var populateDone = function(err, r){
				if(err) return res.err('system');
				depth--;
				if(depth) {
					if(populateOpt.path) populateOpt.path += '.response';
					else populateOpt.path = 'response';
					Comment.populate(r, populateOpt, populateDone);
				} else {
					// fill date strings
					var fillDateString = function(root){
						for(var i=0; i<root.length; i++) {
							root[i].dateString = dateString.date(root[i].time*1000);
							root[i].dateTimeString = dateString.dateTime(root[i].time*1000);
							if(root[i].response && root[i].response.length) fillDateString(root[i].response);
						}
					};
					fillDateString(r);
					res({
						total: count,
						rows: r
					});
				}
			};
			query.exec(populateDone);
		});
	};
	// validate
	if(args.blocked)
		User.checkPermission(conn, 'editor', function(r){
			if(!r) return res.err('noPermission');
			doList();
		});
	else
		doList();
};
