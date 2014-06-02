// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'comment';
var MODEL_NAME = 'Comment';

// define schema
var Schema = fw.db.Schema;
var schemaObj = {
	user: String,
	displayName: String,
	email: String,
	url: String,
	content: String,
	response: Schema.Types.ObjectId,
};
var schema = new Schema(schemaObj, {autoIndex: false});

// create model
module.exports = function(model, cb){
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};