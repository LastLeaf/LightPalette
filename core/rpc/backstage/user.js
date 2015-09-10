// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var EMAIL_REGEXP = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\\\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

var fs = require('fs');
var crypto = require('crypto');
var password = fw.module('password');
var formFilter = fw.module('form_filter');
var Settings = fw.module('db_model').Settings;
var User = fw.module('db_model').User;
var mail = fw.module('mail');

var tmpl = fw.tmpl('user.tmpl');

// returns the user infomation object of current session
exports.current = function(conn, res, args){
	var id = conn.session.userId;
	User.findOne({_id: id}, function(err, r){
		if(err || !r) return res({});
		r.password = !!r.password;
		return res(r);
	});
};

// returns supported languages
exports.locales = function(conn, res, args){
	res(conn.app.config.app.localeNames);
};

// register an user with id, email and password provided
exports.register = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		_id: '',
		password: '',
		email: ''
	});
	if(!args._id.match(/^[-\w]{4,32}$/i)) return res.err('usernameIllegal');
	if(args.email.length > 64 || !args.email.match(EMAIL_REGEXP)) return res.err('emailIllegal');
	if(args.password.length !== 64) return res.err('pwd');
	// determine user type
	User.count({type: 'admin'}, function(err, count){
		if(count) args.type = 'reader';
		else args.type = 'admin';
		// check allow-reg
		Settings.get('user', function(err, r){
			if(args.type !== 'admin' && (err || !r || !r.allowReg)) return res.err('registerNotAllow');
			// set deault args
			args.displayName = args._id;
			var id = args._id.toLowerCase();
			delete args._id;
			password.hash(args.password, function(err, r){
				if(err) return res.err('system');
				args.password = r;
				// check user exists
				User.findOne({_id: id}, function(err, r){
					if(err) return res.err('system');
					if(r) return res.err('idUsed');
					User.update({_id: id}, args, {upsert: true}, function(err){
						if(err) return res.err('system');
						res();
						if(args.type === 'admin') return;
						// send mail to readers
						Settings.get('basic', function(err, r){
							if(err || !r) return;
							var siteTitle = r.siteTitle;
							var host = r.siteHost;
							Settings.get('email', function(err, r){
								if(err || !r) return;
								var mailOptions = r;
								disablePath(conn.app, id, args.email, function(err, r){
									var content = tmpl(conn).regEmail({
										siteTitle: siteTitle,
										host: host || conn.host,
										username: id,
										email: args.email,
										disablePath: r
									});
									console.info(content);
									mail(mailOptions, args.displayName, args.email, tmpl(conn).regEmailTitle({ siteTitle: siteTitle }), content);
								});
							});
						});
					});
				});
			});
		});
	});
};

// login with id and password
exports.login = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		_id: '',
		password: ''
	});
	if(!args._id.match(/^[-\w]{4,32}$/i)) return res.err('usernameIllegal');
	var id = args._id.toLowerCase();
	// check password
	User.findOne({_id: id}).select('type password').exec(function(err, r){
		if(err) return res.err('system');
		if(!r) return res.err('idNull');
		if(r.type === 'disabled') return res.err('idDisabled');
		if(!password.check(args.password, r.password)) return res.err('pwd');
		conn.session.userId = id;
		conn.session.save(function(){
			res();
		});
	});
};

// login with id and password
exports.logout = function(conn, res, args){
	if(!conn.session.userId) return res.err('noLogin');
	delete conn.session.userId;
	conn.session.save(function(){
		res();
	});
};

// recover password
exports.recoverPassword = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		_id: '',
		email: ''
	});
	if(!args._id.match(/^[-\w]{4,32}$/i)) return res.err('usernameIllegal');
	if(args.email.length > 64 || !args.email.match(EMAIL_REGEXP)) return res.err('emailIllegal');
	// check user and email pair
	args._id = args._id.toLowerCase();
	User.findOne({_id: args._id}).select('email').exec(function(err, r){
		if(err || !r) return res.err('idNull');
		if(r.email !== args.email) return res.err('emailNotMatch');
		crypto.randomBytes(6, function(err, r){
			if(err) return res.err('system');
			var pwd = r.toString('base64');
			password.hash(crypto.createHash('sha256').update(args._id + '|' + pwd).digest('hex'), function(err, r){
				if(err) return res.err('system');
				User.update({_id: args._id}, {password: r}, function(){
					res.err('pwdEmail');
					// send email
					Settings.get('basic', function(err, r){
						if(err || !r) return;
						var siteTitle = r.siteTitle;
						var host = r.siteHost;
						Settings.get('email', function(err, r){
							if(err || !r) return;
							var content = tmpl(conn).pwdEmail({
								siteTitle: siteTitle,
								host: host || conn.host,
								username: args._id,
								email: args.email,
								password: pwd
							});
							mail(r, args.displayName, args.email, tmpl(conn).pwdEmailTitle({ siteTitle: siteTitle }), content);
						});
					});
				});
			});
		});
	});
};

// modify the current user (except for id, email and password)
exports.modify = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		displayName: '',
		url: '',
		description: ''
	});
	if(args.displayName.length <= 0 || args.displayName.length > 32) return res.err('displayNameIllegal');
	if(args.url && !args.url.match(/^https?:\/\//)) args.url = 'http://' + args.url;
	if(args.url.length > 1024) return res.err('urlIllegal');
	if(args.description.length > 100) return res.err('descriptionIllegal');
	// check login status
	User.checkPermission(conn, 'reader', function(r){
		if(!r) return res.err('noPermission');
		User.update({_id: conn.session.userId}, args, function(err){
			if(err) return res.err('system');
			res();
		});
	});
};

// modify the current user's password
exports.modifyPassword = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		original: '',
		password: ''
	});
	if(args.original.length !== 64 || args.password.length !== 64) return res.err('pwd');
	// check login status
	User.checkPermission(conn, 'reader', function(r){
		if(!r) return res.err('noPermission');
		User.findOne({_id: conn.session.userId}).select('password').exec(function(err, r){
			if(err) return res.err('system');
			if(!password.check(args.original, r.password)) return res.err('pwd');
			password.hash(args.password, function(err, r){
				if(err) return res.err('system');
				User.update({_id: conn.session.userId}, {password: r}, function(){
					if(err) return res.err('system');
					res();
				});
			});
		});
	});
};

// disable an account from email link
exports.disable = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		_id: '',
		email: '',
		sign: '',
	});
	if(!args._id.match(/^[-\w]{4,32}$/i)) return res.err('usernameIllegal');
	if(args.email.length > 64 || !args.email.match(EMAIL_REGEXP)) return res.err('emailIllegal');
	if(!password.check(args._id+'|'+args.email+'|'+conn.app.config.secret.cookie, args.sign)) return res.err('system');
	User.update({_id: args._id}, {type: 'disabled'}, function(err){
		if(err) return res.err('system');
		res();
	});
};

// generate a disable url for email
var disablePath = function(app, id, email, cb){
	password.hash(id+'|'+email+'|'+app.config.secret.cookie, function(err, r){
		cb(err, '/backstage/user/disable?i=' + id + '&e=' + encodeURIComponent(email) + '&s=' + encodeURIComponent(r));
	});
};

// admin: get user list
exports.list = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		from: 0,
		count: 1
	});
	if(args.from < 0 || args.count <= 0 || args.count >= 50) return res.err('system');
	// check permission
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		User.count(function(err, r){
			if(err) return res.err('system');
			var total = r;
			User.find({}).select('_id displayName type email url description').sort('_id').limit(args.count).skip(args.from).exec(function(err, r){
				if(err) return res.err('system');
				res({
					total: total,
					rows: r
				});
			});
		});
	});
};

// editor: get author list
exports.listAuthors = function(conn, res, args){
	args = formFilter(args, {
		from: 0,
		count: 0
	});
	if(args.count < 0 || args.from < 0) return res.err('system');
	User.checkPermission(conn, 'editor', function(r){
		if(args.count) {
			// get part of all authors
			User.where('type').in(['contributor', 'writer', 'editor', 'admin']).count(function(err, count){
				if(err) return res.err('system');
				User.find().sort('_id').skip(args.from).limit(args.count).exec(function(err, r){
					if(err) return res.err('system');
					res({
						total: count,
						rows: r
					});
				});
			});
		} else {
			// list all authors
			User.find().where('type').in(['contributor', 'writer', 'editor', 'admin']).select('_id displayName').sort('_id').exec(function(err, r){
				if(err) return res.err('system');
				res(r);
			});
		}
	});
};

// admin: create or update a user
exports.set = function(conn, res, args, isAdd){
	// filter data
	args = formFilter(args, {
		_id: '',
		type: '',
		displayName: '',
		email: '',
		url: '',
		description: '',
		password: ''
	});
	if(!args._id.match(/^[-\w]{4,32}$/i)) return res.err('usernameIllegal');
	if(!User.typeLevel(args.type)) return res.err('system');
	if(args.email.length > 64 || !args.email.match(EMAIL_REGEXP)) return res.err('emailIllegal');
	if((isAdd || args.password) && args.password.length !== 64) return res.err('pwdNull');
	if(args.displayName.length <= 0 || args.displayName.length > 32) return res.err('displayNameIllegal');
	if(args.url && !args.url.match(/^https?:\/\//)) args.url = 'http://' + args.url;
	if(args.url.length > 256) return res.err('urlIllegal');
	if(args.description.length > 100) return res.err('descriptionIllegal');
	// check permission
	var id = args._id.toLowerCase();
	delete args._id;
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		var next = function(){
			if(isAdd) {
				args._id = id;
				new User(args).save(function(err){
					if(err) return res.err('system');
					res();
				});
			} else {
				User.update({_id: id}, args, function(err){
					if(err) return res.err('system');
					res();
				});
			}
		};
		if(!args.password) {
			delete args.password;
			next();
		} else {
			password.hash(args.password, function(err, r){
				if(err)  return res.err('system');
				args.password = r;
				next();
			});
		}
	});
};

// admin: remove a user
exports.remove = function(conn, res, args){
	// filter data
	args = formFilter(args, {
		_id: ''
	});
	if(!args._id.match(/^[-\w]{4,32}$/i)) return res.err('usernameIllegal');
	// check permission
	args._id = args._id.toLowerCase();
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		User.remove({_id: args._id}, function(err){
			if(err) return res.err('system');
			res();
		});
	});
};
