// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var POST_LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var hotTable = function($table){
		// build table
		var table = lp.tableBuilder($table, {idCol: '_id', editMore: true, noRemove: true}, [
			{ id: 'post.title', name: _('Title'), input: 'add' },
			{ id: 'post.author.displayName', name: _('Author'), input: 'add' },
			{ id: 'post.dateTimeString', name: _('Publish Time'), input: 'add' },
			{ id: 'visits', name: _('Visits'), input: 'add' },
			{ id: 'extra', type: 'extra', input: 'add' }
		])
		.data(function(page){
			var q = {timeRange: lp.backstage.statRange, from: page*POST_LIST_LEN, count: POST_LIST_LEN};
			pg.rpc('../stat:hotPosts', q, function(r){
				table.setTotal(Math.ceil(r.total/POST_LIST_LEN));
				table.set(r.rows);
			}, function(err){
				lp.backstage.showError(err);
			});
		})
		.setPage(0, 1);
		// table operations
		table.change(function(data, id){
			fw.go('/backstage/stat/post/'+id);
		});
	};

	var urlTable = function($table){
		// build table
		var table = lp.tableBuilder($table, {idCol: '_id', editMore: true, noRemove: true}, [
			{ id: 'path', name: _('Path'), input: 'add' },
			{ id: 'visits', name: _('Visits'), input: 'add' },
			{ id: 'extra', type: 'extra', input: 'add' }
		])
		.data(function(page){
			var q = {timeRange: lp.backstage.statRange, from: page*POST_LIST_LEN, count: POST_LIST_LEN};
			pg.rpc('../stat:hotUrl', q, function(r){
				table.setTotal(Math.ceil(r.total/POST_LIST_LEN));
				var rows = r.rows;
				for(var i=0; i<rows.length; i++)
					rows[i].path = '/' + rows[i].path;
				table.set(rows);
			}, function(err){
				lp.backstage.showError(err);
			});
		})
		.setPage(0, 1);
		// table operations
		table.change(function(data, id){
			window.open(data.path);
		});
	};

	var refererTable = function($table){
		// build table
		var table = lp.tableBuilder($table, {idCol: '_id', editMore: true, noRemove: true}, [
			{ id: 'refSite', name: _('Referer Site'), input: 'add' },
			{ id: 'visits', name: _('Visits'), input: 'add' },
			{ id: 'extra', type: 'extra', input: 'add' }
		])
		.data(function(page){
			var q = {timeRange: lp.backstage.statRange, from: page*POST_LIST_LEN, count: POST_LIST_LEN};
			pg.rpc('../stat:hotRefSite', q, function(r){
				table.setTotal(Math.ceil(r.total/POST_LIST_LEN));
				table.set(r.rows);
			}, function(err){
				lp.backstage.showError(err);
			});
		})
		.setPage(0, 1);
		// table operations
		table.change(function(data, id){
			window.open('http://' + data.refSite);
		});
	};

	var showPage = function(){
		if(pg.destroyed) return;
		var userInfo = lp.backstage.userInfo;
		if(!userInfo._id) return;

		// init page structure
		var $content = $('#content').html(tmpl.main());
		var $table = $content.find('.table');
		var $statTime = $content.find('.stat_time');
		var $statPage = $content.find('.stat_page');

		// check stat page
		var curStatPage = fw.getPath();
		curStatPage = curStatPage.slice(curStatPage.lastIndexOf('/') + 1);
		$statPage.change(function(){
			fw.go($statPage.val());
		}).val(curStatPage);

		// stat range
		if(lp.backstage.statRange)
			$statTime.val(lp.backstage.statRange);
		else
			lp.backstage.statRange = $statTime.val();
		$statTime.change(function(){
			lp.backstage.statRange = $statTime.val();
			table.setPage(0, 1);
		});

		// show table
		if(curStatPage === 'hot') hotTable($table);
		else if(curStatPage === 'url') urlTable($table);
		else if(curStatPage === 'referer') refererTable($table);
	};

	showPage();
});
