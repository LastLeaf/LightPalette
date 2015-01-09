// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var crypto = require('crypto');
var dbData = fw.module('db_data.js');
var password = fw.module('password.js');
var siteController = fw.module('site_controller.js');

// check login status
var loginStatus = function(conn){
	if(!dbData) return;
	return conn.loggedIn || false;
};

// check manager status
exports.checkStatus = function(conn, res, args){
	var status = loginStatus(conn);
	if(status === false) {
		// check whether password is set
		dbData.get('password', function(err, pwd){
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
	if(!dbData) return res.err('notInstalled');
	dbData.get('password', function(err, pwd){
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
	if(!dbData) return res.err('notInstalled');
	dbData.get('password', function(err, pwd){
		if(err) return res.err('system');
		if(pwd && !password.check(String(args.oldPassword), pwd)) return res.err('passwordIncorrect');
		password.hash(String(args.password), function(err, str){
			if(err) return res.err('system');
			dbData.set('password', '', str, function(err){
				if(err) return res.err('system');
				res();
			});
		});
	});
};

// restart sites manager
exports.restart = function(conn, res, args){
	if(loginStatus(conn) === false) return res.err('noPermission');
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
	dbData.getByType('site', Number(args.from) || 0, Number(args.count) || 0, function(err, rows, total){
		if(err) return res.err('system');
		for(var i=0; i<rows.length; i++) delete rows[i].secret;
		res({
			rows: rows,
			total: total
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
	var obj = {_id: id, title: title, permission: permission, status: status, hosts: hosts};
	var setObj = function(oldObj){
		dbData.set(id, 'site', obj, function(err){
			if(err) res.err('system');
			res(obj);
			if(!oldObj || oldObj.status === obj.status) return;
			if(obj.status === 'enabled') siteController.start(obj);
			else siteController.stop(id);
			// TODO fix routing problem when stop a site
		});
	};
	if(add) {
		dbData.get(id, function(err, site){
			if(err || site) res.err('siteExists');
			crypto.randomBytes(24, function(err, buf){
				if(err) return res.err('system');
				obj.secret = buf.toString('base64');
				setObj();
			});
		});
	} else {
		dbData.get(id, function(err, site){
			if(err || !site) res.err('noPermission');
			obj.secret = site.secret;
			setObj(site);
		});
	}
};

// create a new site
exports.deleteSite = function(conn, res, args){
	if(!loginStatus(conn)) return res.err('noPermission');
	var id = String(args._id);
	if(!id.match(/^[-_0-9a-z]+$/i)) return res.err('siteIdIllegal');
	dbData.del(id, function(err){
		if(err) return res.err('system');
		res();
		siteController.stop(id);
		// TODO remove site data
	});
};
