// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var async = require('async');

module.exports = function(app, cb){
	// make static dirs
	async.each([app.config.app.siteRoot + '/static/files'], function(file, cb){
		fs.exists(file, function(exists){
			if(!exists) fs.mkdir(file, cb);
			else cb();
		});
	}, function(){
		cb({
			// preserved path checker
			check: function(path){
				return !!path.match(/^\/?(backstage|index|type|tag|category|series|author|search|post|files|feed|plugins|theme)[\/$]/);
			}
		});
	});
};
