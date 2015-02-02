// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

lp.theme = function(pg){
	var tmpl = pg.tmpl;

	if(!window.localStorage) window.localStorage = {};

	pg.on('wrapperLoaded', function(){
		document.querySelector('.search input').setAttribute('placeholder', tmpl.searchHint());
	});
	pg.on('contentUnloaded', function(){
		document.getElementById('content').innerHTML = '';
	});
	pg.on('contentLoaded', function(){
		// not found
		var notFound = document.querySelector('.post_not_found');
		if(notFound) notFound.innerHTML = tmpl.notFound();
		// single
		var post = document.querySelector('.post_single');
		if(post) {
			var postId = post.getAttribute('post-id');
			// init comment area
			var comment = document.createElement('div');
			comment.setAttribute('class', 'comment');
			var commentConfig = JSON.parse(localStorage['lightPalette-commentConfig'] || "{}");
			comment.innerHTML = tmpl.comment({
				postId: postId,
				userInfo: lp.userInfo,
				displayName: commentConfig.displayName,
				email: commentConfig.email,
				url: commentConfig.url
			});
			lp.comments.form(comment.querySelector('.comment_new>form'), function(){
				comment.querySelector('.comment_error').innerHTML = '';
				comment.querySelector('.submit').disabled = true;
			}, function(){
				if(commentNew.querySelector('[name="url"]')) {
					localStorage['lightPalette-commentConfig'] = JSON.stringify({
						displayName: commentNew.querySelector('[name="displayName"]').value,
						email: commentNew.querySelector('[name="email"]').value,
						url: commentNew.querySelector('[name="url"]').value,
					});
				}
				resetForm();
				reloadComments();
			}, function(err){
				comment.querySelector('.comment_error').innerHTML = tmpl.commentError[err] || tmpl.commentError.system;
				comment.querySelector('.submit').disabled = false;
			});
			post.appendChild(comment);
			var commentNew = comment.querySelector('.comment_new');
			var resetForm = commentNew.querySelector('.comment_cancel').onclick = function(){
				commentNew.querySelector('textarea').value = '';
				commentNew.parentNode.removeChild(commentNew);
				comment.appendChild(commentNew);
				commentNew.querySelector('[name="responseTo"]').value = '';
				comment.querySelector('.comment_error').innerHTML = '';
			};
			// load list
			var commentList = comment.querySelector('.comment_list');
			var reloadComments = function(){
				comment.querySelector('.submit').disabled = true;
				lp.comments.list(postId, function(r){
					commentList.innerHTML = '';
					listComments(commentList, r.rows, 3);
					comment.querySelector('.submit').disabled = false;
				}, function(err){
					commentList.innerHTML = '';
				});
				var listComments = function(div, data, depth){
					var ul = document.createElement('ul');
					div.appendChild(ul);
					while(data.length) {
						var item = data.shift();
						item.depth = depth;
						var li = document.createElement('li');
						li.innerHTML = tmpl.commentItem(item);
						ul.appendChild(li);
						var reply = li.querySelector('.comment_reply>a');
						if(reply) {
							reply.responseToId = item._id;
							reply.onclick = function(){
								if(commentNew.parentNode === this.parentNode) {
									commentNew.parentNode.removeChild(commentNew);
									comment.appendChild(commentNew);
									commentNew.querySelector('[name="responseTo"]').value = '';
								} else {
									commentNew.parentNode.removeChild(commentNew);
									this.parentNode.appendChild(commentNew);
									commentNew.querySelector('[name="responseTo"]').value = this.responseToId;
								}
							};
						}
						if(item.response && item.response.length)
							listComments(li.querySelector('.comment_response'), item.response, depth-1);
					}
				};
			};
			reloadComments();
		}
	});
};

fw.main(function(pg){
	var tmpl = pg.tmpl;

	// read user info
	var wrapper = document.getElementById('wrapper');
	lp.userInfo = {
		_id: wrapper.getAttribute('user-id'),
		displayName: wrapper.getAttribute('user-displayName'),
		type: wrapper.getAttribute('user-type')
	};

	pg.on('render', function(res){
		if(!res) return;
		document.title = res.title;
		document.getElementById('content').innerHTML = res.content;
	});
	pg.on('load', function(){
		if(lp.theme) lp.theme(pg);
		pg.emit('wrapperLoaded');
	});
	pg.on('childUnload', function(){
		content.innerHTML = '';
		pg.emit('contentUnloaded');
	});
	pg.on('childLoadEnd', function(){
		var post = document.getElementById('post_single');
		if(post) {
			// init driver for single post
			lp.driver(post.getAttribute('post-type'), {
				id: post.getAttribute('post-id')
			});
		}
		pg.emit('contentLoaded');
	});
});
