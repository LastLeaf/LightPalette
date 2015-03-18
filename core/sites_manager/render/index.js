// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(conn, args, childRes, next){
	childRes.statusCode = 404;
	next(childRes);
};
