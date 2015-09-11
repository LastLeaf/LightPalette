// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var $settings = $('#settings').html(tmpl.main());
	// load sites
	pg.rpc('/plugins/xbackup/sites:list', function(sites){
		$(tmpl.sites(sites)).insertBefore( $settings.find('.settings_site_add_row') );
	}, lp.backstage.showError);
	pg.form($settings.find('.settings_site_add')[0], function(){
		var removes = [];
		$settings.find('.settings_site_row select').each(function(){
			if($(this).val() === '..') removes.push($(this).attr('siteId'));
		});
		$settings.find('.settings_site_add [name="remove"]').val(removes.join(' '));
		$settings.find('.settings_site_add .submit, .settings_sites select').attr('disabled', true);
	}, function(sites){
		$settings.find('.settings_site_add .submit').removeAttr('disabled');
		$settings.find('.settings_site_row').remove();
		$settings.find('.settings_site_add [name="add"]').val('');
		$(tmpl.sites(sites)).insertBefore( $settings.find('.settings_site_add_row') );
	}, function(err){
		$settings.find('.settings_site_add .submit, .settings_sites select').removeAttr('disabled');
		lp.backstage.showError(err);
	});
});
