// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('upload.tmpl');

var mv = require('mv');
var multiparty = require('multiparty');
var User = fw.module('db_model').User;

module.exports = function(req, res){
	// get user id
	var userId = req.conn.session.userId;
	if(!userId) {
		res.send(403);
		return;
	}
	// permission
	User.checkPermission(req.conn, ['writer', 'editor'], function(writer, editor){
		if(!writer) return res.send(403);
		if(req.method === 'GET') {
			// send page
			res.send(tmpl(req.conn).main());
			return;
		}
		// accept files
		var form = new multiparty.Form({
			maxFieldsSize: fw.config.server.bodySizeLimit,
			maxFilesSize: fw.config.server.bodySizeLimit,
			autoFields: true,
			autoFiles: true,
		});
		form.parse(req, function(err, fields, files){
			if(err) return res.send(500);
			var user = fields.user[0] || '';
			var path = fields.path[0] || '/';
			var next = function(){
				if(path.charAt(0) !== '/') return res.send(403);
				if(path.slice(-1) !== '/') path += '/';
				files = files.file || [];
				var lastErr = null;
				var c = files.length + 1;
				var finished = function(){
					c--;
					if(c) return;
					if(lastErr) return res.status(500).send(tmpl(req.conn).main());
					res.send(tmpl(req.conn).main());
				};
				while(files.length) {
					var file = files.shift();
					mv(file.path, 'static/files/'+user+path+file.originalFilename, function(err){
						if(err) lastErr = err;
						finished();
					});
				}
				finished();
			};
			if(user !== userId) {
				if(!editor) return res.send(403);
				User.findOne({_id: user}, function(err, r){
					if(err) return res.send(500);
					if(!r || User.typeLevel(r.type) < User.typeLevel('contributor'))
						return res.send(403);
					next();
				});
			} else {
				next();
			}
		});
	});
};
