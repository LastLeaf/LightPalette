// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var POST_LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var showPage = function(){
		if(pg.destroyed) return;
		var userInfo = pg.parent.userInfo;
		if(!userInfo._id) return;

		// init page structure
		var $content = $('#content').html(tmpl.main());
		var $table = $content.find('.table');
		var $statTime = $content.find('.stat_time');
		var $statTitle = $content.find('.stat_title');
		var $statMeta = $content.find('.stat_meta');

		// stat range
		if(lp.backstage.statRange)
			$statTime.val(lp.backstage.statRange);
		else
			lp.backstage.statRange = $statTime.val();
		$statTime.change(function(){
			lp.backstage.statRange = $statTime.val();
			table.setPage(0, 1);
		});

		// build table
		var table = lp.tableBuilder($table, {idCol: '_id', editMore: true, noRemove: true}, [
			{ id: 'dateTimeString', name: _('Time'), input: 'add' },
			{ id: 'ip', name: _('IP Address'), input: 'add' },
			{ id: 'sid', name: _('Visitor ID'), input: 'add' },
			{ id: 'extra', type: 'extra', input: 'add' }
		])
		.data(function(page){
			var q = {timeRange: lp.backstage.statRange, post: fw.getArgs().id, from: page*POST_LIST_LEN, count: POST_LIST_LEN};
			pg.rpc('stat:post', q, function(r){
				$statTitle.text(r.post.title);
				$statMeta.html(tmpl.statMeta(r));
				table.setTotal(Math.ceil(r.visits/POST_LIST_LEN));
				var rows = r.rows;
				for(var i=0; i<r.rows.length; i++) {
					var row = r.rows[i];
				}
				table.set(rows);
			}, function(err){
				lp.backstage.showError(err);
			});
		})
		.setPage(0, 1);

		// table operations
		table.change(function(data, id){
			fw.go('/backstage/stat/visitor/'+data.sid);
		});
		$statTime.change(function(){
			table.setPage(0, 1);
		});
	};

	if(pg.parent.userInfo) {
		showPage();
	} else {
		pg.parent.on('userInfoReady', showPage);
	}
});