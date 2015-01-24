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
	if(status !== 'enabled') status = 'disabled';
	var obj = {title: title, permission: permission, status: status, hosts: hosts};
	var setObj = function(oldObj){
		dbSites.update({_id: id}, obj, {upsert: true}, function(err){
			if(err) res.err('system');
			var secret = obj.secret;
			obj.secret = '';
			obj._id = id;
			res(obj);
			obj.secret = secret;
			if((!oldObj && obj.status !== 'enabled') || oldObj.status === obj.status) return;
			if(obj.status === 'enabled') siteController.start(obj);
			else siteController.stop(id);
		});
	};
	if(add) {
		dbSites.findById(id, function(err, site){
			if(err || site) res.err('siteExists');
			crypto.randomBytes(24, function(err, buf){
				if(err) return res.err('system');
				obj.secret = buf.toString('base64');
				setObj();
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
