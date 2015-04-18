// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var SERIES_LIST_LEN = 10;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;
	var userInfo = null;

	var initPage = function(post, postLocal, extraData){
		// check local unsaved
		if(postLocal) {
			delete postLocal._localBackupTime;
			for(var k in postLocal)
				post[k] = postLocal[k];
		}

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
		// time string
		if(post.status !== 'draft')
			$form.find('[name=timeString]').val(post.dateTimeString);
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

		// init editor
		var editor = lp.backstage.driverEditor(post.type, $content.find('.driver')[0], post, userInfo);
		if(!editor.get) editor.get = function(){};
		var editorSavedData = { content: post.content, abstract: post.abstract };
		if(!editor.modified) editor.modified = function(){
			var abstract = $form.find('[name=abstract]').val();
			var content = $form.find('[name=content]').val();
			if(abstract && editorSavedData.abstract !== abstract) return true;
			if(content && editorSavedData.content !== content) return true;
			return false;
		};
		if(!editor.saved) editor.saved = function(data){
			editorSavedData = data;
			var abstract = $form.find('[name=abstract]').val();
			var content = $form.find('[name=content]').val();
			if(abstract && typeof(data.abstract) === 'undefined') data.abstract = abstract;
			if(content && typeof(data.content) === 'undefined') data.content = content;
		};

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
		var $saveStatus = $content.find('.editor_save_status');
		var $save = $content.find('.editor_save').click(function(){
			$form.submit();
		});
		var collectArgs = function(){
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
			// filter path
			args.path = ('/' + args.path).replace(/\/+/, '/').slice(1);
			return { args: args, dynArgs: dynArgs };
		};
		$form.submit(function(e){
			e.preventDefault();
			// rpc
			$save.prop('disabled', true);
			var cargs = collectArgs();
			pg.rpc($form.attr('action') + ':' + $form.attr('method'), cargs.args, function(){
				$save.prop('disabled', false);
				$saveStatus.html(tmpl.saveStatus({
					time: new Date().toLocaleTimeString(),
					link: postLink(cargs.args)
				}));
				editor.saved(cargs.dynArgs);
				localStorage.removeItem('LightPalette:/backstage/post/' + post._id);
			}, function(err){
				$save.prop('disabled', false);
				lp.backstage.showError(err);
			});
			$save.prop('disabled', true);
		});

		// save local on unload
		var saveLocal = function(){
			if(!editor.modified()) return;
			var data = editor.get() || {};
			var abstract = $form.find('[name=abstract]').val();
			var content = $form.find('[name=content]').val();
			if(abstract && typeof(data.abstract) === 'undefined') data.abstract = abstract;
			if(content && typeof(data.content) === 'undefined') data.content = content;
			data.title = $form.find('[name=title]').val();
			data._localBackupTime = Date.now();
			localStorage.setItem('LightPalette:/backstage/post/' + post._id, JSON.stringify(data));
		};
		// auto-save every 5 minutes
		var autoSaveTobj = setInterval(saveLocal, 300000);
		pg.on('unload', function(){
			clearInterval(autoSaveTobj);
		});
		pg.on('unload', saveLocal);
		pg.on('pageUnload', saveLocal);
		
		// show unsaved message
		if(postLocal) {
			$saveStatus.html(tmpl.unsaved()).find('.editor_unsaved').click(function(e){
				e.preventDefault();
				localStorage.removeItem('LightPalette:/backstage/post/' + post._id);
				fw.reload(1);
			});
		}

		// show sidebar button
		$content.find('.sidebar_show a').click(function(){
			$content.find('.sidebar').toggleClass('sidebar-shown');
		});
	};

	// generate post link
	var postLink = function(args){
		var link = '';
		if(args.status === 'pending' || args.status === 'draft') {
			link = '/backstage/preview/' + args._id;
		} else {
			link = ( args.path ? '/' + args.path : '/post/' + args._id );
		}
		return link;
	};

	// get post information
	var getInfo = function(){
		userInfo = lp.backstage.userInfo;
		var next = function(authors){
			// get category list
			pg.rpc('category:list', function(categories){
				var id = fw.getArgs()['*'];
				var local = localStorage.getItem('LightPalette:/backstage/post/' + id);
				var rl = null;
				if(local) rl = JSON.parse(local);
				pg.rpc('post:get', {_id: id, 'originalTimeFormat': 'yes'}, function(r){
					// init page
					initPage(r, rl, {
						categories: categories,
						authors: authors,
						write: (userInfo.type !== 'contributor'),
						edit: (userInfo.type === 'editor' || userInfo.type === 'admin'),
						link: postLink(r)
					});
				}, function(err){
					lp.backstage.showError(err);
					if(err === 'notFound') {
						// remove local unsaved post
						localStorage.removeItem('LightPalette:/backstage/post/' + id);
					}
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

	getInfo();
});
