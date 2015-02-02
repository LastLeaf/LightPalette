// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var natural = require('natural');
var Post = fw.module('/db_model').Post;
var dateString = fw.module('/date_string.js');

module.exports = function(app, cb){
	var tokenizer = new natural.TreebankWordTokenizer();
	var stemmer = natural.LancasterStemmer;

	// db collection used for search
	var Schema = app.db.Schema;
	var schemaObj = {
		s: { type: [String], index: true },
		time: Number
	};
	var schema = new Schema(schemaObj, {autoIndex: false});
	var searchCol = app.db.model(app.config.db.prefix + 'advanced_search', schema);

	// check whether init is needed
	searchCol.count(function(err, inited){

		// methods
		var rebuild = function(){
			// rebuild
			searchCol.remove({}, function(err){
				if(err) return cb(err);
				var stream = Post.find({status: 'published'}).select('_id time title tag abstract content').stream();
				stream.on('data', function(res){
					var arr = tokenizer.tokenize(res.content.replace(/\<.+?\>/g, ''));
					arr = arr.concat(tokenizer.tokenize(res.abstract.replace(/\<.+?\>/g, '')));
					arr = arr.concat(tokenizer.tokenize(res.title));
					arr = arr.concat(res.tag);
					for(var i=0; i<arr.length; i++) arr[i] = stemmer.stem(arr[i]);
					searchCol.update({_id: res._id}, {s: arr, time: res.time}, {upsert: true}).exec();
				});
				stream.on('error', function(err){
					console.error(err.message);
				});
				stream.on('close', function(){});
			});
		};
		var update = function(id, cb){
			if(!cb) cb = function(){};
			// update a post
			Post.findById(id).select('status time title tag abstract content').exec(function(err, res){
				if(err) return cb(err);
				if(!res || res.status !== 'published') {
					// delete
					searchCol.remove({_id: id}, cb);
				} else {
					// update
					var arr = tokenizer.tokenize(res.content.replace(/\<.+?\>/g, ''));
					arr = arr.concat(tokenizer.tokenize(res.abstract.replace(/\<.+?\>/g, '')));
					arr = arr.concat(tokenizer.tokenize(res.title));
					arr = arr.concat(res.tag);
					for(var i=0; i<arr.length; i++) arr[i] = stemmer.stem(arr[i]);
					searchCol.update({_id: id}, {s: arr, time: res.time}, {upsert: true}).exec(cb);
				}
			});
		};
		var search = function(str, skip, limit, cb){
			var arr = tokenizer.tokenize(str);
			for(var i=0; i<arr.length; i++) arr[i] = stemmer.stem(arr[i]);
			searchCol.count().where('s').all(arr).exec(function(err, count){
				if(err) return cb('system');
				if(!count) return cb(null, { total: 0, rows: [] });
				searchCol.find().select('_id').where('s').all(arr).sort('-time').skip(skip).limit(limit).exec(function(err, res){
					if(err) return cb('system');
					Post.find().or(res).select('_id path type title status author time category tag series abstract')
						.populate('author', '_id displayName').populate('category', '_id title').populate('series', '_id title')
						.sort('-time').exec(function(err, r){
							if(err) return res.err('system');
							for(var i=0; i<r.length; i++) {
								r[i].dateString = dateString.date(r[i].time*1000);
								r[i].dateTimeString = dateString.dateTime(r[i].time*1000);
							}
							cb(null, {
								total: count,
								rows: r
							});
						});
				});
			});
		};

		// return api
		if(!inited) rebuild();
		cb({
			rebuild: rebuild,
			update: update,
			search: search
		});
	});
};
