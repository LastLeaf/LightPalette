// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('disable.tmpl');

module.exports = function(req, res){
	req.conn.rpc('/backstage/comment:disableNotify', {
		_id: req.query.i || '',
		email: req.query.e || '',
		sign: req.query.s || '',
	}, function(){
		res.status(200).send(tmpl(req.conn).done());
	}, function(err){
		res.send(403);
	});
};
