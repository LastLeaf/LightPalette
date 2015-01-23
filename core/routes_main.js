// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var path = require('path');

exports.global = {
	lib: '/lib/crypto.min',
	main: 'global',
};

// frontstage drivers
var drivers = exports.drivers = {
	parent: 'global',
	main: {
		src: [],
	},
	style: {
		src: [],
	},
	tmpl: {
		src: [],
	},
};
var dirs = fs.readdirSync(fw.config.lpCoreRoot + '/client/drivers');
for(var i=dirs.length-1; i>=0; i--) {
	var dir = dirs[i];
	if(!fs.statSync(fw.config.lpCoreRoot + '/client/drivers/' + dir).isDirectory())
		continue;
	var files = fs.readdirSync(fw.config.lpCoreRoot + '/client/drivers/' + dir);
	for(var j=files.length-1; j>=0; j--) {
		var file = files[j];
		var ext = path.extname(file);
		if(ext === '.js' && file.slice(-7) !== '.min.js') {
			if(file === 'main.js')
				drivers.main.src.push('drivers/' + dir + '/' + file);
			else
				drivers.main.src.unshift('drivers/' + dir + '/' + file);
		}
		if(ext === '.stylus' || (ext === '.css' && file.slice(-8) !== '.min.css')) {
			if(file === 'main.stylus' || file === 'main.css')
				drivers.style.src.push('drivers/' + dir + '/' + file);
			else
				drivers.style.src.unshift('drivers/' + dir + '/' + file);
		}
		if(ext === '.tmpl') {
			if(file === 'main.tmpl')
				drivers.tmpl.src.push('drivers/' + dir + '/' + file);
			else
				drivers.tmpl.src.unshift('drivers/' + dir + '/' + file);
		}
	}
}

// frontstage
exports.theme = {
	parent: 'drivers',
	render: 'theme',
	reload: 'both'
};

exports['*'] = {
	parent: 'theme',
	render: 'content',
};
