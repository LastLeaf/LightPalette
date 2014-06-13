// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var SERIES_LIST_LEN = 10;

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
		$form.find('[name=author]').val(post.author._id);
		// categories
		var categoryMap = {};
		for(var i=0; i<post.category.length; i++)
			categoryMap[post.category[i]._id] = true;
		$form.find('[name="category[]"]').each(function(){
			if(categoryMap.hasOwnProperty(this.value) && categoryMap[this.value])
				this.checked = true;
		});
		// tags
		$form.find('[name=tag]').val(post.tag.join('\r\n'));
		var editor = lp.driverEditor(post.type, $content.find('.driver')[0], post);

		// series
		var $series = $form.find('.sidebar_series');
		var $seriesSelect = $form.find('.sidebar_series_select');
		var $seriesInput = $form.find('[name=series]');
		$seriesSelect.on('change', '[name=seriesRadio]', function(){
			$seriesInput.val(this.value);
		});
		var seriesSelectPage = function(num){
			$seriesSelect.fadeTo(200, 0.5);
			pg.rpc('series:list', {from: num*SERIES_LIST_LEN, count: SERIES_LIST_LEN}, function(r){
				$seriesInput.val('');
				if(num > 0) r.prev = true;
				if(num + 1 < Math.ceil(r.total/SERIES_LIST_LEN)) r.next = true;
				$seriesSelect.html(tmpl.seriesSelect(r))
					.find('.sidebar_series_prev').click(function(){
						seriesSelectPage(num-1);
					}).end()
					.find('.sidebar_series_next').click(function(){
						seriesSelectPage(num+1);
					}).end()
				.fadeTo(200, 1);
			}, function(err){
				lp.backstage.showError(err);
			});
		};
		if(post.series) {
			$('<option value="id-'+escape(post.series._id)+'" selected></option>').text(post.series.title).appendTo($series);
			$seriesInput.val(post.series._id);
		} else {
			$series.val('none');
			$seriesInput.val('');
		}
		$series.change(function(){
			var val = $series.val();
			if(val === 'none') {
				$seriesSelect.hide();
				$seriesInput.val('');
			} else if(val === 'select') {
				seriesSelectPage(0);
				$seriesInput.val('');
			} else {
				$seriesSelect.hide();
				$seriesInput.val(unescape($series.val().slice(3)));
			}
		});

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