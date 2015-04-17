// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var models = [
	'user.js',
	'settings.js',
	'settings_plugins.js',
	'settings_themes.js',
	'series.js',
	'category.js',
	'post.js',
	'comment.js',
	'stat.js',
	'stat_path.js',
	'stat_referer.js'
];

module.exports = function(app, next){
	var model = {};
	var nextModel = function(){
		if(!models.length) {
			next(model);
		} else {
			require('./'+models.shift())(app, model, nextModel);
		}
	};
	nextModel();
};
