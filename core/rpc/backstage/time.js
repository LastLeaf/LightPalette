// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('form_filter');
var User = fw.module('db_model').User;
var Category = fw.module('db_model').Category;
var Post = fw.module('db_model').Post;
var dateString = fw.module('date_string.js');

// list timezones
exports.listTimezones = function(conn, res, args){
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		res(dateString.list);
	});
};

// convert time to string
exports.dateString = function(conn, res, args){
	args = formFilter(args, {
		time: [Number, /[0-9]+/g]
	});
	var arr = args.time;
	var r = [];
	while(arr.length)
		r.push(dateString.date(arr.shift()*1000));
	res(r);
};
exports.dateTimeString = function(conn, res, args){
	args = formFilter(args, {
		time: [Number, /[0-9]+/g]
	});
	var arr = args.time;
	var r = [];
	while(arr.length)
		r.push(dateString.dateTime(arr.shift()*1000));
	res(r);
};
