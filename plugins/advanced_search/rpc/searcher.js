// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var User = fw.module('/db_model').User;
var searcher = fw.module('/plugins/advanced_search/searcher.js');

exports.rebuildIndex = function(conn, res){
	User.checkPermission(conn, 'admin', function(r){
		if(!r) return res.err('noPermission');
		searcher.rebuild();
		res();
	});
};
