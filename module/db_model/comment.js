// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'comment';
var MODEL_NAME = 'Comment';

module.exports = function(model, cb){
	// define schema
	var Schema = fw.db.Schema;
	var schemaObj = {
		user: { type: String, ref: fw.config.db.prefix + 'user' },
		displayName: String,
		email: String,
		acceptNotify: Boolean,
		url: String,
		content: String,
		response: [{ type: Schema.Types.ObjectId, ref: fw.config.db.prefix + COLLECTION_NAME }],
		responseTo: { type: Schema.Types.ObjectId, ref: fw.config.db.prefix + COLLECTION_NAME },
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};