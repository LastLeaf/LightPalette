// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'stat';
var MODEL_NAME = 'Stat';

module.exports = function(model, cb){
	// define schema
	var Schema = fw.db.Schema;
	var schemaObj = {
		post: { type: Schema.Types.ObjectId, ref: fw.config.db.prefix + 'post' },
		time: { type: Number },
		dateTimeString: String,
		sid: { type: String },
		ip: { type: String }
	};
	var schema = new Schema(schemaObj, {autoIndex: false});
	schema.index({ time: -1 });
	schema.index({ post: 1, time: -1 });
	schema.index({ sid: 1, time: -1 });
	schema.index({ ip: 1, time: -1 });

	// create model
	var col = fw.db.model(fw.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};