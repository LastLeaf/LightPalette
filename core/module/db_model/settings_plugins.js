// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var COLLECTION_NAME = 'settings.plugins';
var MODEL_NAME = 'PluginSettings';

module.exports = function(app, model, cb){
	// define schema
	var Schema = app.db.Schema;
	var schemaObj = {
		v: Schema.Types.Mixed,
		_id: { type: String, index: { unique: true } },
	};
	var schema = new Schema(schemaObj, {autoIndex: false});

	// functions
	schema.statics.get = function(key, cb){
		this.findOne({_id: key}, function(err, res){
			if(err) cb(err);
			else if(!res) cb(null);
			else cb(null, res.v);
		});
	};
	schema.statics.set = function(key, value, cb){
		this.update({_id: key}, {v: value}, {upsert: true}, cb);
	};

	// create model
	var col = app.db.model(app.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(cb);
};