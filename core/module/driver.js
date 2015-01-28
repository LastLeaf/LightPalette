// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var path = require('path');

var drivers = {};

module.exports = function(app, next){
	next({
		set: function(id, handlers){
			drivers[id] = handlers;
		},
		get: function(id){
			return drivers[id];
		},
		list: function(){
			var arr = [];
			for(var k in drivers) arr.push(k);
			return arr;
		}
	});
};
