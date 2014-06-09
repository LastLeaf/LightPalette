// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('form_filter');
var Settings = fw.module('db_model').Settings;
var User = fw.module('db_model').User;
var mail = fw.module('mail');

var tmpl = fw.tmpl('settings.tmpl');

// set blog settings
exports.set = function(conn, res, args){
	if(typeof(args) !== 'object') return res.err('system');
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		var key = args._key;
		for(var k in args)
			if(k.charAt(0) === '_')
				delete args[k];
		Settings.set(key, args, function(err){
			if(err) return res.err('system');
			res();
		});
	});
};

// get blog settings 
exports.get = function(conn, res, key){
	if(!key) return res.err('system');
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		Settings.get(key, function(err, r){
			if(err) return res.err('system');
			res(r);
		});
	});
};

// send test email
exports.testEmail = function(conn, res, args){
	args = formFilter(args, {
		name: '',
		addr: '',
		host: '',
		port: 0,
		ssl: '',
		user: '',
		password: ''
	});
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		User.findOne({id: conn.session.userId}).select('displayName email').exec(function(err, r){
			if(err || !r) return res.err('system');
			mail(args, r.displayName, r.email, tmpl(conn).i18n('WordPalette Email Test'), tmpl(conn).testEmail(), null, function(err){
				if(err) res.err('mail', err.data||err.code);
				else res(r.email);
			});
		});
	});
};