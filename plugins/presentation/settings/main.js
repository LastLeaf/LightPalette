// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	pg.rpc('/backstage/addons:pluginSettings', 'presentation', function(settings){
		var $settings = $('#settings').html(pg.tmpl.main());
		var $form = $settings.find('form').submit(function(e){
			e.preventDefault();
			$form.find('.submit').attr('disabled', true);
			pg.rpc('/backstage/addons:pluginSettings', 'presentation', {
				enableSync: !!$form.find('#settings_sync').val()
			}, function(){
				$form.find('.submit').removeAttr('disabled');
			}, function(err){
				lp.backstage.showError(err);
				$form.find('.submit').removeAttr('disabled');
			});
		});
		if(settings && settings.enableSync) $form.find('#settings_sync').val('all');
	}, function(err){
		lp.backstage.showError(err);
	});
});
