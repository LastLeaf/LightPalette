// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var crypto = require('crypto');
var dbSettings = fw.module('db_settings.js');
var dbSites = fw.module('db_sites.js');
var password = fw.module('password.js');
var siteController = fw.module('site_controller.js');
var sitesConfig = require('../config_sites.js');

// check login status
var loginStatus = function(conn){
	if(!dbSettings) return;
	return conn.loggedIn || false;
};

// check manager status
exports.checkStatus = function(conn, res, args){
	var status = loginStatus(conn);
	if(status === false) {
		// check whether password is set
		dbSettings.get('password', function(err, pwd){
			if(err || !pwd) return res.err('passwordNotSet');
			res.err('noPermission');
		});
	} else if(status === true) {
		res(true);
	} else {
		res.err('notInstalled');
	}
};

// login
exports.login = function(conn, res, args){
	if(!dbSettings) return res.err('notInstalled');
	dbSettings.get('password', function(err, pwd){
		if(err || !pwd) return res.err('passwordNotSet');
		if(password.check(String(args.password), pwd)) {
			conn.loggedIn = true;
			res();
		} else {
			res.err('passwordIncorrect');
		}
	});
};

// set password
exports.setPassword = function(conn, res, args){
	if(!dbSettings) return res.err('notInstalled');
	dbSettings.get('password', function(err, pwd){
		if(err) return res.err('system');
		if(pwd && !password.check(String(args.oldPassword), pwd)) return res.err('passwordIncorrect');
		password.hash(String(args.password), function(err, str){
			if(err) return res.err('system');
			dbSettings.set('password', str, function(err){
				if(err) return res.err('system');
				res();
			});
		});
	});
};

// restart sites manager
exports.restart = function(conn, res, args){
	if(loginStatus(conn) === false) return res.err('noPermission');
	conn.app.setConfig(sitesConfig());
	conn.app.restart();
};

// restart sites manager
exports.restartFw = function(conn, res, args){
	if(loginStatus(conn) === false) return res.err('noPermission');
	try {
		fw.restart();
	} catch(e) {
		res.err('system');
	}
};

// get sites information
exports.listSites = function(conn, res, args){
	if(!loginStatus(conn)) return res.err('noPermission');
	dbSites.count(function(err, total){
		if(err) return res.err('system');
		dbSites.find().sort('_id').skip(Number(args.from) || 0).limit(Number(args.count) || 0).exec(function(err, rows){
			if(err) return res.err('system');
			for(var i=0; i<rows.length; i++) rows[i].secret = '';
			res({
				rows: rows,
				total: total
			});
		});
	});
};

// create a new site
exports.updateSite = function(conn, res, args, add){
	if(!loginStatus(conn)) return res.err('noPermission');
	var id = String(args._id);
	var title = String(args.title) || '';
	var permission = String(args.permission) || '';
	var status = String(args.status);
	var hosts = String(args.hosts).match(/\S+/g) || [];
	if(!id.match(/^[-_0-9a-z]+$/i)) return res.err('siteIdIllegal');
	var setObj = function(site){
		site.title = title;
		site.permission = permission;
		var oldStatus = site.status;
		site.status = status;
		site.hosts = hosts;
		site.save(function(err){
			if(err) res.err('system');
			var secret = site.secret;
			site.secret = '';
			res(site.toObject());
			site.secret = secret;
			if(site.status === oldStatus) return;
			if(site.status !== 'disabled') siteController.start(site.toObject());
			else siteController.stop(id);
		});
	};
	if(add) {
		dbSites.findById(id, function(err, site){
			if(err || site) res.err('siteExists');
			site = new dbSites({_id: id});
			crypto.randomBytes(24, function(err, buf){
				if(err) return res.err('system');
				site.secret = buf.toString('base64');
				site.status = 'disabled';
				setObj(site);
			});
		});
	} else {
		dbSites.findById(id, function(err, site){
			if(err || !site) res.err('noPermission');
			setObj(site);
		});
	}
};

// create a new site
exports.deleteSite = function(conn, res, args){
	if(!loginStatus(conn)) return res.err('noPermission');
	var id = String(args._id);
	if(!id.match(/^[-_0-9a-z]+$/i)) return res.err('siteIdIllegal');
	dbSites.remove({_id: id}, function(err){
		if(err) return res.err('system');
		res();
		siteController.stop(id);
		// TODO remove site data
	});
};
