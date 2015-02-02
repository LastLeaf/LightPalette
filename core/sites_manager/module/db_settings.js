// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, next){
	// check whether db is available
	if(!app.db) return next(null);

	// define schema
	var Schema = app.db.Schema;
	var schemaObj = {
		v: Schema.Types.Mixed,
		_id: { type: String, index: { unique: true } },
	};
	var schema = new Schema(schemaObj, {autoIndex: false, collection: app.config.db.prefix});

	// functions
	schema.statics.get = function(key, cb){
		this.findOne({_id: key}, function(err, res){
			if(err) cb(err);
			else if(!res) cb(null);
			else cb(null, res.v);
		});
	};
	schema.statics.set = function(key, value, cb){
		this.update({_id: key}, {v: value}, {upsert: true}, function(err){
			cb(err);
		});
	};
	schema.statics.del = function(key, cb){
		this.remove({_id: key}, function(err){
			cb(err);
		});
	};

	// create model
	var col = app.db.model(app.config.db.prefix, schema);
	col.ensureIndexes(function(){
		next(col);
	});
};
