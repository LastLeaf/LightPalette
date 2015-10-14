// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var POST_LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var showPage = function(){
		if(pg.destroyed) return;
		var userInfo = lp.backstage.userInfo;
		if(!userInfo._id) return;

		// init page structure
		var $content = $('#content').html(tmpl.main());
		var $table = $content.find('.table');

		// init filter
		var $filters = $content.find('.post_filters');
		var filterObj = { status: 'all' };
		var filterChanged = function(){
			var curFilter = $filterType.val();
			$filters.find('.post_filter').hide();
			$filters.find('.post_filter-' + curFilter).show();
		};
		var $filterType = $filters.find('.post_filter_type').change(filterChanged);
		filterChanged();

		// filter events
		$filters.find('.post_filter-search input').change(function(){
			filterObj = { search: this.value, status: 'all' };
			table.setPage(0, 1);
		});
		$filters.find('.post_filter-title input').change(function(){
			filterObj = { title: this.value, status: 'all' };
			table.setPage(0, 1);
		});
		$filters.find('.post_filter-meta select').change(function(){
			filterObj = {
				type: $filters.find('.post_filter_post_type').val(),
				author: $filters.find('.post_filter_author').val(),
				status: $filters.find('.post_filter_status').val()
			};
			table.setPage(0, 1);
		});

		// get type list
		var driverList = lp.backstage.driverList(userInfo.type);
		for(var i=0; i<driverList.length; i++) {
			$('<option></option>').attr('value', driverList[i].id).text(driverList[i].name).appendTo( $filters.find('.post_filter_post_type') );
		}

		// get author list
		if(userInfo.type !== 'editor' && userInfo.type !== 'admin') {
			$filters.find('.post_filter_author option').attr('value', userInfo._id).text(userInfo.displayName);
		} else {
			pg.rpc('user:listAuthors', function(rows){
				var $authors = $filters.find('.post_filter_author');
				for(var i=0; i<rows.length; i++) {
					$('<option></option>').attr('value', rows[i]._id).text(rows[i].displayName).appendTo( $authors );
				}
			});
		}

		// build table
		var table = lp.tableBuilder($table, {idCol: '_id', editMore: true}, [
			{ id: 'title', name: _('Title'), input: 'add' },
			{ id: 'type', name: _('Type'), input: 'add' },
			{ id: 'author.displayName', name: _('Author'), input: 'add' },
			{ id: 'status', name: _('Status'), input: 'add' },
			{ id: 'extra', type: 'extra', input: 'add' }
		])
		.data(function(page){
			filterObj.from = page*POST_LIST_LEN;
			filterObj.count = POST_LIST_LEN;
			if(userInfo.type !== 'editor' && userInfo.type !== 'admin')
				filterObj.author = userInfo._id;
			$filters.find('input, select').attr('disabled', true);
			pg.rpc('post:list', filterObj, function(r){
				$filters.find('input, select').removeAttr('disabled');
				table.setTotal(Math.ceil(r.total/POST_LIST_LEN));
				var rows = r.rows;
				for(var i=0; i<r.rows.length; i++) {
					var row = r.rows[i];
					row.type = lp.backstage.driverName(row.type);
					row.status = _(row.status);
					var extra = [];
					extra.push(row.dateTimeString);
					if(row.series)
						extra.push(row.series.title);
					for(var j=0; j<row.category.length; j++)
						extra.push(row.category[j].title);
					row.extra = extra.join(' / ');
				}
				table.set(rows);
			}, function(err){
				$filters.find('input, select').removeAttr('disabled');
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
				table.enableModify(id);
			});
		});
	};

	showPage();
});
