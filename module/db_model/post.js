// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'post';
var MODEL_NAME = 'Post';

module.exports = function(model, cb){
	// define schema
	var Schema = fw.db.Schema;
	var schemaObj = {
		type: String,
		path: { type: String, index: true, default: '' },
		title: { type: String, default: '' },
		status: { type: String, default: 'draft', enum: [
			'draft', 'pending', 'visible', 'published'
		] },
		author: { type: String, ref: fw.config.db.prefix + 'user' },
		time: { type: Number },
		dateString: String,
		dateTimeString: String,
		category: [{ type: String, ref: fw.config.db.prefix + 'category' }],
		tag: { type: [String], default: [] },
		series: { type: String, ref: fw.config.db.prefix + 'series' },
		acceptComment: { type: Boolean, default: true },
		content: { type: String, default: '' },
		abstract: { type: String, default: '' },
		extra: String,
		driver: Object
	};
	var schema = new Schema(schemaObj, {autoIndex: false});
	schema.index({ time: -1 });
	schema.index({ status: 1, time: -1 });
	schema.index({ title: 1, time: -1 });
	schema.index({ author: 1, time: -1 });
	schema.index({ category: 1, time: -1 });
	schema.index({ tag: 1, time: -1 });
	schema.index({ series: 1, time: -1 });

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;

	// full text search for mongodb >= 2.6.0
	fw.db.connection.db.collection(col.collection.name, function(err, mongoCol){
		mongoCol.ensureIndex({title: 'text', tag: 'text', abstract: 'text', content: 'text'}, {name: 'fulltext', default_language: 'none', language_override: 'search_language'}, function(err){
			col.ensureIndexes(cb);
		});
	});
};