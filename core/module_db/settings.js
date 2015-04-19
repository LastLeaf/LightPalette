// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var model = fw.module('db_model');

var COLLECTION_NAME = 'settings';
var MODEL_NAME = 'Settings';

module.exports = function(app, cb){
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
		this.update({_id: key}, {v: value}, {upsert: true}, function(){
			if(changeEvents[key])
				for(var i=0; i<changeEvents[key].length; i++)
					changeEvents[key][i]();
			cb();
		});
	};

	// update bindings
	var changeEvents = {};
	schema.statics.changed = function(key, cb){
		if(!changeEvents.hasOwnProperty(key)) changeEvents[key] = [ cb ];
		else changeEvents[key].push(cb);
	};

	// create model
	var col = app.db.model(app.config.db.prefix + COLLECTION_NAME, schema);
	model[MODEL_NAME] = col;
	col.ensureIndexes(function(){
		cb();
	});
};
