// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, next){
	// dateString: convert a unix timestamp or js time to date string
	var tzZones = require('timezone/zones.js');
	var tz = require('timezone/loaded');
	var tzCur = tz;
	var conf = {
		timezone: '',
		dateFormat: '%F',
		dateTimeFormat: '%F %T',
	};

	// get all time strings
	var tzList = [];
	var tzMap = {};
	for(var i=0; i<tzZones.length; i++) {
		if(tzZones[i].constructor === Array) continue;
		var zones = tzZones[i].zones;
		if(!zones) continue;
		for(var k in zones)
			tzList.push(k);
	}
	tzList.sort();

	// convert function
	var convert = function(d, format){
		d = d || 0;
		return tzCur(d, format, conf.timezone);
	};

	next({
		list: tzList,
		config: function(newConf){
			try {
				var tzConf = require('timezone/' + newConf.timezone);
				if(!tzConf.zones) throw new Error();
				tzCur = tz(tzConf);
				conf = newConf;
			} catch(e) {
				return false;
			}
			return true;
		},
		dateTime: function(d, format){
			return convert(d, format || conf.dateTimeFormat || '%F %T');
		},
		date: function(d, format){
			return convert(d, format || conf.dateFormat || '%F');
		},
		parse: function(s){
			return tzCur(s, conf.timezone);
		}
	});
};
