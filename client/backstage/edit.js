// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var initPage = function(post, extraData){

		// show content
		var $content = $('#content').html(tmpl.main(extraData));
		var $form = $content.find('.editor');
		$form.find('[name]').each(function(){
			var name = $(this).attr('name');
			if(!post[name]) return;
			if(typeof(post[name]) === 'string') this.value = post[name];
		});
		// author
		$('[name=author]').val(post.author._id);
		// categories
		for(var i=0; i<post.category.length; i++)
			$('#sidebar_category_'+post.category[i]._id).prop('checked', true);
		// tags
		$('[name=tag]').val(post.tag.join('\r\n'));
		var editor = lp.driverEditor(post.type, $content.find('.driver')[0], post);

		// save
		var $save = $content.find('.editor_save').click(function(){
			$form.submit();
		});
		$form.submit(function(e){
			e.preventDefault();
			// collect args
			var args = {
				_id: post._id,
			};
			var dynArgs = editor.get();
			var a = $form[0].elements;
			for(var i=0; i<a.length; i++) {
				// parse inputs
				var name = a[i].name;
				if(!name || ((a[i].type === 'radio' || a[i].type === 'checkbox') && a[i].checked === false)) continue;
				if(name.slice(-2) === '[]') {
					name = name.slice(0, -2);
					if(args[name]) args[name].push(a[i].value);
					else args[name] = [a[i].value];
				} else {
					args[name] = a[i].value;
				}
			}
			for(var k in dynArgs)
				args[k] = dynArgs[k];
			// rpc
			$save.prop('disabled', true);
			pg.rpc($form.attr('action') + ':' + $form.attr('method'), args, function(){
				$save.prop('disabled', false);
			}, function(err){
				$save.prop('disabled', false);
				lp.backstage.showError(err);
			});
			$save.prop('disabled', true);
		});
	};

	// get post information
	var getInfo = function(){
		var userInfo = pg.parent.parent.userInfo;
		var next = function(authors){
			// get category list
			pg.rpc('post:get', {_id: fw.getArgs()['*']}, function(r){
				pg.rpc('category:list', function(categories){
					// init page
					initPage(r, {
						categories: categories,
						authors: authors,
						write: (userInfo.type !== 'contributor'),
						edit: (userInfo.type === 'editor' || userInfo.type === 'admin')
					});
				}, function(err){
					lp.backstage.showError(err);
				});
			}, function(err){
				lp.backstage.showError(err);
			});
		};
		// get author list
		if(userInfo.type === 'editor' || userInfo.type === 'admin') {
			pg.rpc('user:listAuthors', function(authors){
				next(authors);
			}, function(err){
				lp.backstage.showError(err);
			});
		} else {
			next();
		}
	};

	if(pg.parent.parent.userInfo) {
		getInfo();
	} else {
		pg.parent.on('userInfoReady', getInfo);
	}	
});