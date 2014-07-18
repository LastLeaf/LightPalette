// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'statPost';
var MODEL_NAME = 'StatPost';

module.exports = function(model, cb){
	// define schema
	var Schema = fw.db.Schema;
	var schemaObj = {
		post: { type: Schema.Types.ObjectId, index: true, ref: fw.config.db.prefix + 'post' },
		date: { type: Number, index: true },
		reads: { type: Number, index: true, default: 0 },
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};