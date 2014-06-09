// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'post';
var MODEL_NAME = 'Post';

module.exports = function(model, cb){
	// define schema
	var Schema = fw.db.Schema;
	var schemaObj = {
		type: String,
		path: { type: String, default: '' },
		title: { type: String, index: true, default: '' },
		status: { type: String, default: 'draft', enum: [
			'draft', 'pending', 'published'
		] },
		author: { type: String, index: true, ref: fw.config.db.prefix + 'user' },
		time: { type: Number, index: true },
		category: { type: [String], index: true, ref: fw.config.db.prefix + 'category' },
		tag: { type: [String], index: true, default: [] },
		series: { type: String, index: true, ref: fw.config.db.prefix + 'series' },
		content: { type: String, default: '' },
		abstract: { type: String, default: '' },
		driver: Object
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// full text search for mongodb >= 2.6.0
	schema.index({title: 'text'});
	schema.index({tag: 'text'});
	schema.index({content: 'text'});

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};