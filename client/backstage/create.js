// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var $btns = $('#content').html(tmpl.main(lp.listDrivers())).find('input');
	$btns.click(function(){
		var $this = $(this);
		var type = $this.attr('driverId');
		$btns.attr('disabled', true);
		pg.rpc('post:create', {type: type}, function(_id){
			$('#content').html(pg.parent.parent.tmpl.busy());
			fw.go('/backstage/post/' + _id);
		}, function(err){
			lp.backstage.showError(err);
			$btns.removeAttr('disabled');
		});
	});
});