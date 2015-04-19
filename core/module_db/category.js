// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var model = fw.module('db_model');

var COLLECTION_NAME = 'category';
var MODEL_NAME = 'Category';

module.exports = function(app, cb){
	// define schema
	var Schema = app.db.Schema;
	var schemaObj = {
		_id: { type: String, index: { unique: true } },
		title: String,
		description: String,
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// create model
	var col = app.db.model(app.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(function(){
		cb();
	});
};
