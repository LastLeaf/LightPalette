// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'comment';
var MODEL_NAME = 'Comment';

module.exports = function(app, model, cb){
	// define schema
	var Schema = app.db.Schema;
	var schemaObj = {
		time: { type: Number },
		dateString: String,
		dateTimeString: String,
		blocked: { type: Boolean, default: false },
		post: { type: Schema.Types.ObjectId, ref: app.config.db.prefix + 'post' },
		user: { type: String, default: '', ref: app.config.db.prefix + 'user' },
		displayName: { type: String, default: '' },
		email: { type: String, default: '' },
		acceptNotify: { type: Boolean, default: true },
		url: { type: String, default: '' },
		content: { type: String, default: '' },
		response: [{ type: Schema.Types.ObjectId, default: [], ref: app.config.db.prefix + COLLECTION_NAME }],
		responseTo: { type: Schema.Types.ObjectId, ref: app.config.db.prefix + COLLECTION_NAME },
	};
	var schema = new Schema(schemaObj, {autoIndex: false});
	schema.index({ time: -1 });
	schema.index({ blocked: 1, time: -1 });
	schema.index({ post: 1, time: 1 });
	schema.index({ post: 1, blocked: 1, time: 1 });

	// create model
	var col = app.db.model(app.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};
