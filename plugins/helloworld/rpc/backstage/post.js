// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(conn, res, args){
	console.log('Hello World! A new RPC to "post"...');
	res.next();
};
