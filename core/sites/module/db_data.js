// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, next){
	// check whether db is available
	if(!app.db) return next(null);

	// define schema
	var Schema = app.db.Schema;
	var schemaObj = {
		t: String,
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
	schema.statics.getByType = function(type, cb){
		this.find({t: type}).select('v').exec(function(err, res){
			if(err) return cb(err);
			var arr = [];
			for(var i=0; i<res.length; i++) {
				arr.push(res[i].v);
			}
			cb(null, arr);
		});
	};
	schema.statics.set = function(key, type, value, cb){
		this.update({_id: key}, {t: type, v: value}, {upsert: true}, function(){
			cb();
		});
	};

	// create model
	var col = app.db.model(app.config.db.prefix, schema);
	col.ensureIndexes(function(){
		next(col);
	});
};
