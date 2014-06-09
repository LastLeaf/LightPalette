// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('disable.tmpl');

module.exports = function(req, res){
	req.conn.rpc('/backstage/user:disable', {
		id: req.query.i || '',
		email: req.query.e || '',
		sign: req.query.s || '',
	}, function(){
		res.send(200, tmpl(req.conn).done());
	}, function(err){
		res.send(403);
	});
};