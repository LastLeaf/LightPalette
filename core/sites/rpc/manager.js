// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

// restart sites manager
exports.restart = function(conn, res, args){
	// TODO broken
	conn.app.restart();
};
