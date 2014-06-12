// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');

module.exports = function(cb){
	// make static dirs
	if(!fs.existsSync('static/avatar'))
		fs.mkdir('static/avatar');
	if(!fs.existsSync('static/files'))
		fs.mkdir('static/files');

	cb({
		// preserved path checker
		check: function(path){
			return !!path.match(/^\/?(backstage|index|tag|category|series|author|search|post|avatar|files)[\/$]/);
		}
	});
};