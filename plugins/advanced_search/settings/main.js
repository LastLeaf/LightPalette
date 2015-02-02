// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var $settings = $('#settings').html(pg.tmpl.main());
	var $form = $settings.find('form').submit(function(e){
		e.preventDefault();
		$form.find('.submit').attr('disabled', true);
		pg.rpc('/plugins/advanced_search/searcher:rebuildIndex', function(){
			$form.find('.submit').removeAttr('disabled').attr('value', pg.tmpl.rebuildSent());
		}, function(err){
			lp.backstage.showError(err);
			$form.find('.submit').removeAttr('disabled');
		});
	});
});
