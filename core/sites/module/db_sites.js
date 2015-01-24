// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

module.exports = function(app, next){
	// check whether db is available
	if(!app.db) return next(null);

	// define schema
	var Schema = app.db.Schema;
	var schemaObj = {
		_id: { type: String, index: { unique: true } },
		title: String,
		permission: String,
		status: String,
		secret: String,
		hosts: [String]
	};
	var schema = new Schema(schemaObj, {autoIndex: false, collection: app.config.db.prefix + '.~sites'});

	// create model
	var col = app.db.model(app.config.db.prefix + '.~sites', schema);
	col.ensureIndexes(function(){
		next(col);
	});
};
