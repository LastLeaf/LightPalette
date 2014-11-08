// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	// init page structure
	var $content = $('#content').html(tmpl.main());
	var $table = $content.find('.table');

	// build table
	var table = lp.tableBuilder($table, {idCol: '_id'}, [
		{ id: 'displayName', name: _('User'), input: 'add' },
		{ id: 'email', name: _('Email'), input: 'add' },
		{ id: 'url', name: _('URL'), input: 'add' },
		{ id: 'post.title', name: _('Post'), input: 'add' },
		{ id: 'dateTimeString', name: _('Time'), input: 'add' },
		{ id: 'blocked', name: _('Blocked'), input: {
			'false': _('no'),
			'true': _('yes')
		} },
		{ id: 'content', type: 'extra', input: 'add' }
	])
	.data(function(page){
		pg.rpc('comment:list', {desc: 'yes', blocked: 'yes', depth: 1, from: page*LIST_LEN, count: LIST_LEN}, function(r){
			table.setTotal(Math.ceil(r.total/LIST_LEN));
			var rows = r.rows;
			table.set(rows);
		}, function(err){
			lp.backstage.showError(err);
		});
	})
	.setPage(0, 1);

	// table operations
	table.add(function(data){
		pg.rpc('comment:create', data, function(){
			table.addRow(data._id, data);
		}, function(err){
			lp.backstage.showError(err);
			table.enableAdd();
		});
	});
	table.change(function(data, _id){
		pg.rpc('comment:block', {
			_id: _id,
			blocked: (data.blocked === 'true' ? 'yes' : '')
		}, function(){
			table.setRow(_id, data);
		}, function(err){
			lp.backstage.showError(err);
			table.enableModify(_id);
		});
	});
	table.remove(function(_id){
		pg.rpc('comment:remove', {_id: _id}, function(){
			table.removeRow(_id);
		}, function(err){
			lp.backstage.showError(err);
			table.enableModify(_id);
		});
	});
});
