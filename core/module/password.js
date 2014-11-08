// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var crypto = require('crypto');

module.exports = function(next){
	next({
		// hash: generate auth string for str, cb(err, auth)
		hash: function(str, cb){
			crypto.randomBytes(24, function(err, res){
				if(err) {
					cb(err);
					return;
				}
				var s = crypto.createHmac('sha256', res).update(str).digest('base64');
				var auth = res.toString('base64') + '.' + s;
				cb(null, auth);
			});
		},
		// check: check whether str matches auth string
		check: function(str, auth){
			var a = auth.split('.');
			var salt = new Buffer(a[0], 'base64');
			return (a[1] === crypto.createHmac('sha256', salt).update(str).digest('base64'));
		}
	});
};
