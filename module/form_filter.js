// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(next){
	// formFilter: filter args to match pattern, including the data type, pattern value as default.
	next(function(args, pattern){
		var res = {};
		if(typeof(args) !== 'object') args = {};
		for(var k in pattern) {
			if(typeof(args[k]) === 'undefined') {
				if(pattern[k].constructor === Array)
					res[k] = [];
				else
					res[k] = pattern[k];
			} else {
				if(pattern[k].constructor === Array) {
					// array
					res[k] = [];
					if(args[k].constructor === Array) {
						var arr = args[k];
					} else {
						var regex = pattern[k][1];
						if(regex)
							arr = args[k].toString().match(regex) || [];
						else
							arr = [args[k]];
					}
					var type = pattern[k][0];
					if(type === String) {
						while(arr.length)
							res[k].push(arr.pop().toString());
					} else if(type === Number) {
						while(arr.length) {
							var num = Number(arr.pop());
							if(!isNaN(num)) res[k].push(num);
						}
					}
				} else if(typeof(pattern[k]) === 'string') {
					// string
					res[k] = args[k].toString();
				} else if(typeof(pattern[k]) === 'number') {
					// number
					res[k] = Number(args[k]);
					if(isNaN(res[k])) res[k] = pattern[k];
				}
			}
		}
		return res;
	});
};