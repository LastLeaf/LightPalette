// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'stat';
var MODEL_NAME = 'Stat';

module.exports = function(model, cb){
	// define schema
	var Schema = fw.db.Schema;
	var schemaObj = {
		post: { type: Schema.Types.ObjectId, index: true, ref: fw.config.db.prefix + 'post' },
		time: { type: Number, index: true },
		sid: { type: String, index: true },
		ip: { type: String, index: true }
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};