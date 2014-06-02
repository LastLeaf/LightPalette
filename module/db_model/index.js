// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var models = [
	'user.js',
	'settings.js',
	'post.js',
	'comment.js'
];

module.exports = function(next){
	var model = {};
	if(fw.db) {
		var nextModel = function(){
			if(!models.length) {
				next(model);
			} else {
				require('./'+models.shift())(model, nextModel);
			}
		};
		nextModel();
	} else {
		next(model);
	}
};
