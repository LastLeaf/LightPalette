// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'user';
var MODEL_NAME = 'User';

var TYPEVAL = {
	admin: 5,
	editor: 4,
	writer: 3,
	contributor: 2,
	reader: 1,
	disabled: -1
};

// define schema
var Schema = fw.db.Schema;
var schemaObj = {
	id: { type: String, index: true },
	type: { type: String, index: true, enum: [
		'disabled', 'reader', 'contributor', 'writer', 'editor', 'admin'
	] },
	displayName: String,
	email: String,
	url: { type: String, default: '' },
	description: { type: String, default: '' },
	password: String,
	avatar: { type: String, default: '' }
};
var schema = new Schema(schemaObj, {autoIndex: false});

// functions
schema.statics.checkPermission = function(conn, type, res){
	this.findOne({id: conn.session.userId}).select('type').exec(function(err, r){
		if(typeof(type) !== 'object') {
			if(err || !r)
				res(false);
			else
				res(TYPEVAL[r.type] >= TYPEVAL[type]);
		} else {
			var a = [];
			for(var i=0; i<type.length; i++)
				if(err || !r)
					a.push(false);
				else
					a.push(TYPEVAL[r.type] >= TYPEVAL[type[i]]);
			res.apply(global, a);
		}
	});
};
schema.statics.typeLevel = function(type){
	return TYPEVAL[type];
};

// create models
module.exports = function(model, cb){
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};