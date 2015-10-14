// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var USER_LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;
	var tableBuilder = pg.import('table_builder.subm');
	var backstage = pg.importAncestor('backstage');

	// init page structure
	var $content = $('#content').html(tmpl.main());
	var $table = $content.find('.table');

	// build table
	var table = tableBuilder($table, {idCol: '_id'}, [
		{ id: '_id', name: _('Username'), input: 'add' },
		{ id: 'displayName', name: _('Display Name') },
		{ id: 'type', name: _('Type'), input: {
			admin: _('admin'),
			editor: _('editor'),
			writer: _('writer'),
			contributor: _('contributor'),
			reader: _('reader'),
			disabled: _('disabled')
		} },
		{ id: 'email', name: _('Email') },
		{ id: 'url', name: _('URL') },
		{ id: 'password', name: _('Password'), input: 'password' },
		{ id: 'description', type: 'extra' }
	], {
		type: 'reader'
	})
	.data(function(page){
		pg.rpc('user:list', {from: page*USER_LIST_LEN, count: USER_LIST_LEN}, function(r){
			table.setTotal(Math.ceil(r.total/USER_LIST_LEN));
			var rows = r.rows;
			for(var i=0; i<rows.length; i++) {
				rows[i].password = '******';
			}
			table.set(rows);
		}, function(err){
			backstage.showError(err);
		});
	})
	.setPage(0, 1);

	// table operations
	table.add(function(data){
		if(data.password)
			data.password = CryptoJS.SHA256(data._id.toLowerCase() + '|' + data.password).toString();
		pg.rpc('user:set', data, true, function(){
			data.password = '******';
			table.addRow(data._id, data);
		}, function(err){
			backstage.showError(err);
			table.enableAdd();
		});
	});
	table.change(function(data){
		if(data.password)
			data.password = CryptoJS.SHA256(data._id.toLowerCase() + '|' + data.password).toString();
		pg.rpc('user:set', data, false, function(){
			data.password = '******';
			table.setRow(data._id, data);
		}, function(err){
			backstage.showError(err);
			table.enableModify(data._id);
		});
	});
	table.remove(function(_id){
		pg.rpc('user:remove', {_id: _id}, function(){
			table.removeRow(_id);
		}, function(err){
			backstage.showError(err);
			table.enableModify(_id);
		});
	});
});
