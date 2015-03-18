// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('/form_filter.js');
var searcher = fw.module('/plugins/advanced_search/searcher.js');

exports.modify = function(conn, res, args){
	var id = String(args._id);
	res.next(function(conn, res, args){
		searcher.update(id);
		res();
	});
};

exports.modify = function(conn, res, args){
	var id = String(args._id);
	res.next(function(){
		searcher.update(id);
		res();
	});
};

exports.list = function(conn, res, args){
	if(!args.search) return res.next();
	args = formFilter(args, {
		search: '',
		from: 0,
		count: 10
	});
	if(args.count > 20 || args.count < 1 || args.from < 0) return res.err('system');
	searcher.search(args.search, args.from, args.count, function(err, r){
		if(err) return res.err('system');
		res(r);
	});
};
