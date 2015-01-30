// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var FILES_LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var initPage = function(conf){
		var $content = $('#content').html(tmpl.main(conf));
		var $table = $content.find('.table');
		var $user = $content.find('.user').val(conf.curAuthor);
		var $path = $content.find('.path').text('/');
		var curPath = '/';
		var curFiles = {};
		var siteBase = 'http://' + location.host + '/files/';

		// load a path
		var loadPath = function(page, path){
			if(path) {
				if(path === '..')
					path = curPath.slice(0, curPath.lastIndexOf('/', curPath.length-2));
				if(path.slice(-1) !== '/') path += '/';
				curPath = path;
			} else {
				path = curPath;
			}
			$path.text(path);
			$content.find('.location input').prop('disabled', true);
			// list files
			curFiles = {};
			pg.rpc('file:list', {user: $user.val(), path: path, from: page*FILES_LIST_LEN, count: FILES_LIST_LEN}, function(r){
				table.setTotal(Math.ceil(r.total/FILES_LIST_LEN));
				var files = r.rows;
				var base = siteBase + $user.val() + path;
				for(var i=0; i<files.length; i++) {
					if(files[i].dir) {
						files[i].dir = 'yes';
						files[i].extra = _('folder');
					} else {
						files[i].dir = '';
						files[i].extra = base + files[i].name;
					}
				}
				table.set(files);
				$content.find('.location input').prop('disabled', false);
			}, function(err){
				lp.backstage.showError(err);
				$content.find('.location input').prop('disabled', false);
			});
		};
		$user.change(function(){
			loadPath(0, '/');
		});
		$content.find('.path_parent').click(function(){
			loadPath(0, '..');
		});

		// init table
		var table = lp.tableBuilder($table, {idCol: 'name', editMore: true}, [
			{ id: 'name', name: _('Name'), input: 'add' },
			{ id: 'dir', type: 'hidden' },
			{ id: 'dateTimeString', name: _('Modified Time'), input: 'add' },
			{ id: 'extra', type: 'extra', input: 'add' }
		])
		.data(function(page){
			loadPath(page);
		})
		.setPage(0, 1);

		// table operations
		table.change(function(data, id){
			if(data.dir)
				loadPath(0, curPath + id);
			else
				window.open(siteBase + $user.val() + curPath + id, '_blank');
			table.enableModify(id);
		});
		table.remove(function(id){
			pg.rpc('file:remove', {user: $user.val(), path: curPath, name: id}, function(){
				table.removeRow(id);
			}, function(err){
				lp.backstage.showError(err);
				table.enableModify(id);
			});
		});

		// create folder
		var $createDir = $content.find('.create_dir');
		pg.form($createDir[0], function(){
			$createDir.find('input').prop('disabled', true);
			$createDir.find('[name=user]').val($user.val());
			$createDir.find('[name=path]').val(curPath);
		}, function(data){
			data.dir = 'yes';
			data.extra = _('folder');
			table.setRow(data.name, data);
			$createDir.find('input').prop('disabled', false);
			$createDir[0].reset();
		}, function(err){
			lp.backstage.showError(err);
			$createDir.find('input').prop('disabled', false);
		});

		// upload submit
		var $uploadIframe = $content.find('.upload_iframe').load(function(){
			if(!$uploadSubmit.prop('disabled')) return;
			table.setPage();
			$uploadSubmit.prop('disabled', false);
		});
		var $uploadSubmit = $content.find('.upload_submit').click(function(){
			$uploadIframe.contents().find('[name=user]').val($user.val());
			$uploadIframe.contents().find('[name=path]').val(curPath);
			$uploadIframe.contents().find('form').submit();
			this.disabled = true;
		});
	};

	// get author list
	var getAuthors = function(next){
		var userInfo = lp.backstage.userInfo;
		// get author list
		if(userInfo.type === 'editor' || userInfo.type === 'admin') {
			pg.rpc('user:listAuthors', function(authors){
				initPage({
					authors: authors,
					curAuthor: userInfo._id
				});
			}, function(err){
				lp.backstage.showError(err);
			});
		} else {
			initPage({
				authors: [userInfo],
				curAuthor: userInfo._id
			});
		}
	};

	getAuthors();
});
