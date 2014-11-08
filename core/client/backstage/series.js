// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var showPage = function(authorList){
		var userInfo = lp.backstage.userInfo;

		// init page structure
		var $content = $('#content').html(tmpl.main());
		var $table = $content.find('.table');

		// build table
		var table = lp.tableBuilder($table, {idCol: '_id'}, [
			{ id: 'title', name: _('Title') },
			{ id: '_id', name: _('Short Name'), input: 'add' },
			{ id: 'owner._id', name: _('Main Author'), input: authorList },
			{ id: 'description', type: 'extra' }
		], {})
		.data(function(page){
			pg.rpc('series:list', {from: page*LIST_LEN, count: LIST_LEN}, function(r){
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
			data.owner = data.owner._id;
			pg.rpc('series:create', data, function(){
				data.owner = { _id: data.owner };
				table.addRow(data._id, data);
			}, function(err){
				lp.backstage.showError(err);
				table.enableAdd();
			});
		});
		table.change(function(data){
			data.owner = data.owner._id;
			pg.rpc('series:modify', data, function(){
				data.owner = { _id: data.owner };
				table.setRow(data._id, data);
			}, function(err){
				lp.backstage.showError(err);
				table.enableModify(data._id);
			});
		});
		table.remove(function(_id){
			pg.rpc('series:remove', {_id: _id}, function(){
				table.removeRow(_id);
			}, function(err){
				lp.backstage.showError(err);
				table.enableModify(_id);
			});
		});
	};

	var getAuthorList = function(next){
		if(lp.backstage.userInfo.type === 'writer') {
			var obj = {};
			obj[lp.backstage.userInfo._id] = lp.backstage.userInfo.displayName;
			showPage(obj);
			return;
		}
		pg.rpc('user:listAuthors', function(r){
			var obj = {
				'': ''
			};
			for(var i=0; i<r.length; i++)
				obj[r[i]._id] = r[i].displayName;
			showPage(obj);
		}, function(err){
			lp.backstage.showError(err);
		});
	};

	if(lp.backstage.userInfo) {
		getAuthorList();
	} else {
		pg.parent.on('userInfoReady', getAuthorList);
	}
});
