// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var models = [
	'user.js',
	'settings.js',
	'series.js',
	'category.js',
	'post.js',
	'comment.js',
	'stat.js'
];

module.exports = function(next){
	var model = {};
	var nextModel = function(){
		if(!models.length) {
			next(model);
		} else {
			require('./'+models.shift())(model, nextModel);
		}
	};
	nextModel();
};
