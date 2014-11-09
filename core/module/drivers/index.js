// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var path = require('path');

var drivers = {};

module.exports = function(app, next){
	fs.readdir(__dirname, function(err, files){
		while(!err && files.length) {
			var file = files.shift();
			if(path.extname(file) !== '.js') continue;
			if(file === 'index.js') continue;
			var name = file.slice(0, -3);
			drivers[name] = require(__dirname + '/' + file);
		}
		next(drivers);
	});
};
