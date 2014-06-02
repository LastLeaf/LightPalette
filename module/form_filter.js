// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(next){
	// formFilter: filter args to match pattern, including the data type, pattern value as default.
	next(function(args, pattern){
		var res = {};
		if(typeof(args) !== 'object') args = {};
		for(var k in pattern) {
			if(typeof(args[k]) === 'undefined') {
				res[k] = pattern[k];
			} else {
				if(typeof(pattern[k]) === 'string') {
					res[k] = args[k].toString();
				} else if(typeof(pattern[k]) === 'number') {
					res[k] = Number(args[k]);
					if(isNaN(res[k])) res[k] = pattern[k];
				}
			}
		}
		return res;
	});
};