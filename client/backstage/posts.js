// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var POST_LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var showPage = function(){
		if(pg.destroyed) return;
		var userInfo = pg.parent.parent.userInfo;
		if(!userInfo._id) return;

		// init page structure
		var $content = $('#content').html(tmpl.main());
		var $table = $content.find('.table');

		// build table
		var table = lp.tableBuilder($table, {idCol: '_id', editMore: true}, [
			{ id: 'title', name: _('Title'), input: 'add' },
			{ id: 'type', name: _('Type'), input: 'add' },
			{ id: 'status', name: _('Status'), input: 'add' },
			{ id: 'author.displayName', name: _('Author'), input: 'add' },
			{ id: 'time', type: 'extra', input: 'add' }
		])
		.data(function(page){
			var q = {status: 'all', from: page*POST_LIST_LEN, count: POST_LIST_LEN};
			if(userInfo.type !== 'editor' && userInfo.type !== 'admin')
				q.author = userInfo._id;
			pg.rpc('post:list', q, function(r){
				table.setTotal(Math.ceil(r.total/POST_LIST_LEN));
				var rows = r.rows;
				for(var i=0; i<r.rows.length; i++) {
					var row = r.rows[i];
					row.type = lp.driverName(row.type);
					row.status = _(row.status);
					row.time = new Date(row.time*1000).toLocaleString();
				}
				table.set(rows);
			}, function(err){
				lp.backstage.showError(err);
			});
		})
		.setPage(0, 1);

		// table operations
		table.change(function(data, id){
			fw.go('post/'+id);
		});
		table.remove(function(id){
			pg.rpc('post:remove', {_id: id}, function(){
				table.removeRow(id);
			}, function(err){
				lp.backstage.showError(err);
				table.enableModify(data.id);
			});
		});
	};

	if(pg.parent.parent.userInfo) {
		showPage();
	} else {
		pg.parent.on('userInfoReady', showPage);
	}
});