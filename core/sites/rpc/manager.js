// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var dbData = fw.module('db_data.js');
var password = fw.module('password.js');

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
