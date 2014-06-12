// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'series';
var MODEL_NAME = 'Series';

module.exports = function(model, cb){
	// define schema
	var Schema = fw.db.Schema;
	var schemaObj = {
		_id: { type: String, index: { unique: true } },
		title: String,
		description: String,
		time: { type: Number, index: true },
		owner: { type: String, index: true, ref: fw.config.db.prefix + 'user' },
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};