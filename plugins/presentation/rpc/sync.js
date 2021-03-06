// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var formFilter = fw.module('/form_filter.js');
var Post = fw.module('/db_model').Post;
var User = fw.module('/db_model').User;
var PluginSettings = fw.module('/db_model').PluginSettings;

var currentSlides = {};
currentSlides.init = function(id){
	currentSlides[id] = {
		col: 0,
		row: 0,
		senders: [],
		readers: []
	};
};
currentSlides.addReader = function(id, conn){
	if(!currentSlides[id]) currentSlides.init(id);
	currentSlides[id].readers.push(conn);
	conn.on('close', function(){
		if(!currentSlides[id]) return;
		var readers = currentSlides[id].readers;
		for(var i=0; i<readers.length; i++)
			if(readers[i] === conn) {
				readers.splice(i, 1);
				break;
			}
		currentSlides.checkEmpty(id);
	});
};
currentSlides.addSender = function(id, conn){
	if(!currentSlides[id]) currentSlides.init(id);
	if(!currentSlides[id].senders.length) currentSlides.enable(id);
	currentSlides[id].senders.push(conn);
	conn.on('close', function(){
		currentSlides.removeSender(id, conn);
	});
};
currentSlides.removeSender = function(id, conn){
	if(!currentSlides[id]) return;
	var senders = currentSlides[id].senders;
	for(var i=0; i<senders.length; i++)
		if(senders[i] === conn) {
			senders.splice(i, 1);
			break;
		}
	if(!currentSlides[id].senders.length) currentSlides.disable(id);
	currentSlides.checkEmpty(id);
};
currentSlides.checkEmpty = function(id){
	if(currentSlides[id].senders.length || currentSlides[id].readers.length)
		return;
	delete currentSlides[id];
};
currentSlides.enable = function(id){
	var readers = currentSlides[id].readers;
	for(var i=0; i<readers.length; i++)
		readers[i].msg('/plugins/presentation/sync:'+id, { type: 'reader' });
};
currentSlides.disable = function(id){
	var readers = currentSlides[id].readers;
	for(var i=0; i<readers.length; i++)
		readers[i].msg('/plugins/presentation/sync:'+id, { type: 'none' });
};
currentSlides.send = function(id, col, row){
	if(!currentSlides[id]) return;
	var readers = currentSlides[id].readers;
	currentSlides[id].col = col;
	currentSlides[id].row = row;
	for(var i=0; i<readers.length; i++)
		readers[i].msg('/plugins/presentation/sync:'+id, { type: 'progress', col: col, row: row });
};

exports.currentSlide = {
	listen: function(conn, res, postId){
		if(!postId || postId.length !== 24) return res.err('system');
		if(conn['/plugins/presentation/sync:'+postId]) return res.err('system');
		PluginSettings.get('presentation', function(err, r){
			if(err || !r || !r.enableSync) return res.err('noPermission');
			Post.findOne({_id: String(postId)}).select('_id type author').exec(function(err, r){
				if(err || r.type !== 'presentation') return res.err('system');
				postId = r._id;
				if(conn.session.userId === r.author) {
					conn['/plugins/presentation/sync:'+postId] = 'senderReady';
					res({ type: 'sender' });
				} else {
					currentSlides.addReader(postId, conn);
					conn['/plugins/presentation/sync:'+postId] = 'reader';
					if(currentSlides[postId].senders.length)
						res({ type: 'reader', col: currentSlides[postId].col, row: currentSlides[postId].row });
					else
						res({ type: 'none' });
				}
			});
		});
	},
	send: function(conn, res, args){
		if(!args || !args.id || args.id.length !== 24) return res.err('system');
		if(conn['/plugins/presentation/sync:'+args.id] !== 'senderReady') return res.err('system');
		conn['/plugins/presentation/sync:'+args.id] = 'sender';
		currentSlides.addSender(args.id, conn);
		res();
		currentSlides.send(args.id, Number(args.col) || 0, Number(args.row) || 0);
	},
	progress: function(conn, res, args){
		if(!args || !args.id || args.id.length !== 24) return res.err('system');
		if(conn['/plugins/presentation/sync:'+args.id] !== 'sender') return;
		currentSlides.send(args.id, Number(args.col) || 0, Number(args.row) || 0);
	},
	sendEnd: function(conn, res, postId){
		if(!postId || postId.length !== 24) return res.err('system');
		if(conn['/plugins/presentation/sync:'+postId] !== 'sender') return res.err('system');
		conn['/plugins/presentation/sync:'+postId] = 'senderReady';
		currentSlides.removeSender(postId, conn);
		res();
	}
};
