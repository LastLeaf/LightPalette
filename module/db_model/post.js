// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'post';
var MODEL_NAME = 'Post';

// define schema
var Schema = fw.db.Schema;
var schemaObj = {
	type: String,
	path: { type: String, default: '' },
	title: { type: String, default: '' },
	status: { type: String, default: 'draft', enum: [
		'draft', 'pending', 'published'
	] },
	author: String,
	time: { type: Number, index: true },
	category: { type: [String], index: true, default: [] },
	tag: { type: [String], index: true, default: [] },
	series: String,
	content: { type: String, default: '' },
	abstract: { type: String, default: '' },
	driver: Object
};
var schema = new Schema(schemaObj, {autoIndex: false});

// create model
module.exports = function(model, cb){
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};