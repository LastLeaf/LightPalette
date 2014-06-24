// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

(function(){
	var drivers = {};
	lp.registerDriver = function(id, options){
		drivers[id] = options;
	};
	lp.listDrivers = function(userType){
		var r = [];
		for(var k in drivers) {
			if(drivers[k].permission) {
				var permission = drivers[k].permission;
				if(permission === 'admin' && userType !== 'admin')
					continue;
				if(permission === 'editor' && userType !== 'admin' && userType !== 'editor')
					continue;
				if(permission === 'writer' && userType !== 'admin' && userType !== 'editor' && userType !== 'writer')
					continue;
			}
			r.push({
				id: k,
				name: drivers[k].name
			});
		}
		r.sort(function(a, b){
			return (drivers[b.id].priority || 0) - (drivers[a.id].priority || 0);
		});
		return r;
	};
	lp.driverName = function(id){
		if(drivers[id]) return drivers[id].name;
		return '';
	};
	lp.driverEditor = function(id, div, data){
		if(drivers[id] && drivers[id].editor)
			return drivers[id].editor(div, data);
	};
})();