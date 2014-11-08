// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var RSS = require('rss');
var Settings = fw.module('db_model').Settings;
var Post = fw.module('db_model').Post;

var feedGen = function(conn, cb){
	// init basic info
	Settings.get('basic', function(err, r){
		if(err) return cb(err);
		var urlPrefix = 'http://' + (r.siteHost||conn.host);
		var feed = new RSS({
			title: r.siteTitle || '',
			description: r.siteDescription || '',
			feed_url: urlPrefix + '/feed',
			site_url: urlPrefix,
			copyright: r.siteCopyright || '',
		});
		Post.find({status: 'published'}).where('time').lte(Math.floor(new Date().getTime() / 1000))
			.select('_id path title author time category content')
			.populate('author', 'displayName').populate('category', 'title')
			.sort('-time').limit(10).exec(function(err, r){
				if(err) return cb(err);
				// add items
				while(r.length) {
					var post = r.shift();
					var categories = [];
					for(var i=0; i<post.category.length; i++)
						categories.push(post.category[i].title);
					feed.item({
						title: post.title,
						description: post.content,
						url: urlPrefix + '/' + post.path,
						guid: post._id.toString(),
						categories: categories,
						author: post.author.displayName,
						date: new Date(post.time*1000).toString(),
					});
				}
				cb(null, feed.xml());
			});
	});
};

module.exports = function(req, res){
	feedGen(req.conn, function(err, xml){
		if(err) {
			res.send(500);
			return;
		}
		res.type('text/xml; charset=UTF-8');
		res.send(xml);
	});
};