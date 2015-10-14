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
		{ id: 'title', name: _('Title') },
		{ id: '_id', name: _('Short Name'), input: 'add' },
		{ id: 'description', type: 'extra' }
	], {})
	.data(function(page){
		pg.rpc('category:list', {from: page*LIST_LEN, count: LIST_LEN}, function(r){
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
		pg.rpc('category:create', data, function(){
			table.addRow(data._id, data);
		}, function(err){
			lp.backstage.showError(err);
			table.enableAdd();
		});
	});
	table.change(function(data){
		pg.rpc('category:modify', data, function(){
			table.setRow(data._id, data);
		}, function(err){
			lp.backstage.showError(err);
			table.enableModify(data._id);
		});
	});
	table.remove(function(_id){
		pg.rpc('category:remove', {_id: _id}, function(){
			table.removeRow(_id);
		}, function(err){
			lp.backstage.showError(err);
			table.enableModify(_id);
		});
	});
});
