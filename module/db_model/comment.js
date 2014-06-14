// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'comment';
var MODEL_NAME = 'Comment';

module.exports = function(model, cb){
	// define schema
	var Schema = fw.db.Schema;
	var schemaObj = {
		time: { type: Number, index: true },
		dateString: String,
		dateTimeString: String,
		blocked: { type: Boolean, default: false },
		post: { type: Schema.Types.ObjectId, index: true, ref: fw.config.db.prefix + 'post' },
		user: { type: String, default: '', ref: fw.config.db.prefix + 'user' },
		displayName: { type: String, default: '' },
		email: { type: String, default: '' },
		acceptNotify: { type: Boolean, default: true },
		url: { type: String, default: '' },
		content: { type: String, default: '' },
		response: [{ type: Schema.Types.ObjectId, default: [], ref: fw.config.db.prefix + COLLECTION_NAME }],
		responseTo: { type: Schema.Types.ObjectId, ref: fw.config.db.prefix + COLLECTION_NAME },
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};