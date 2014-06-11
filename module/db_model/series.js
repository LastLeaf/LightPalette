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
		owner: { type: String, index: true, ref: fw.config.db.prefix + 'user' },
		post: { type: [Schema.Types.ObjectId], ref: fw.config.db.prefix + 'post' },
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};