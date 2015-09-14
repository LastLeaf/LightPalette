// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var $settings = $('#settings').html(tmpl.main({ localDomain: location.host, userInfo: lp.backstage.userInfo }));
	$settings.find('input, select').attr('disabled', true);

	// get backup status
	$settings.find('.settings_backup_abort').hide();
	var updateStatus = function(){
		$settings.find('.settings_backup_now').attr('disabled', true);
		$settings.find('.settings_backup_abort').attr('disabled', true);
		pg.rpc('/plugins/xbackup/settings:backupStatus', function(started, log){
			$settings.find('.settings_backup_now').removeAttr('disabled');
			$settings.find('.settings_backup_abort').removeAttr('disabled');
			if(started) {
				$settings.find('.settings_backup_now').hide();
				$settings.find('.settings_backup_abort').show();
				document.documentElement.scrollTop = 0;
				setTimeout(updateStatus, 5000);
			} else {
				$settings.find('.settings_backup_now').show();
				$settings.find('.settings_backup_abort').hide();
				updateSites();
			}
			$settings.find('.settings_backup_status').text(log);
		}, function(err){
			$settings.find('.settings_backup_now').removeAttr('disabled');
			$settings.find('.settings_backup_abort').removeAttr('disabled');
			lp.backstage.showError(err);
		});
	};
	updateStatus();
	$settings.find('.settings_backup_now').click(function(){
		$(this).attr('disabled', true);
		pg.rpc('/plugins/xbackup/settings:startBackup', function(){
			updateStatus();
		}, lp.backstage.showError);
	});
	$settings.find('.settings_backup_abort').click(function(){
		$(this).attr('disabled', true);
		pg.rpc('/plugins/xbackup/settings:abortBackup', function(){
			updateStatus();
		}, lp.backstage.showError);
	});

	// load sites
	var $sites = $settings.find('.settings_site_add');
	var updateSites = function(){
		$sites.find('.submit, select').attr('disabled', true);
		pg.rpc('/plugins/xbackup/sites:list', function(sites){
			$sites.find('.settings_site_row').remove();
			$(tmpl.sites(sites)).insertBefore( $sites.find('.settings_site_add_row') );
			$sites.find('input, select').removeAttr('disabled');
			$sites.find('select').change(function(){
				var $select = $(this);
				var val = $select.val();
				if(val === '' || val === '..') return;
				var siteId = $select.attr('siteId');
				if(!siteId) siteId = 'local';
				else siteId += '.site';
				window.open('/plugins/xbackup/download/' + siteId + '/' + val);
			});
		}, lp.backstage.showError);
	};
	pg.form($sites[0], function(){
		var removes = [];
		$sites.find('.settings_site_row select').each(function(){
			if($(this).val() === '..') removes.push($(this).attr('siteId'));
		});
		$sites.find('[name="remove"]').val(removes.join(' '));
		$sites.find('.submit, select').attr('disabled', true);
	}, function(sites){
		$sites.find('[name="add"]').val('');
		updateSites();
	}, function(err){
		$sites.find('.submit, select').removeAttr('disabled');
		lp.backstage.showError(err);
	});

	// load settings
	var $config = $('.settings_backup_config');
	var $dbBlacklist = $('.settings_blacklist_db');
	var $fsBlacklist = $('.settings_blacklist_fs');
	pg.rpc('/plugins/xbackup/settings:get', function(data){
		// config
		$config.find('[name]').each(function(){
			$(this).val( data.config[$(this).attr('name')] );
		});
		$config.find('[name="timed"]').val( data.config.timed ? 'yes' : '' );
		$config.find('[name="sendTo"]').val( data.config.sendTo.join(' ') );
		$config.find('input, select').removeAttr('disabled');
		// blacklist
		$(tmpl.blacklist(data.db.sort())).insertBefore( $dbBlacklist.find('input').removeAttr('disabled') )
			.find('[name]').each(function(){
				if( data.config.dbBlacklist.indexOf($(this).attr('name')) >= 0 ) this.value = 'yes';
			});
		$(tmpl.blacklist(data.fs.sort())).insertBefore( $fsBlacklist.find('input').removeAttr('disabled') )
			.find('[name]').each(function(){
				if( data.config.fsBlacklist.indexOf($(this).attr('name')) >= 0 ) this.value = 'yes';
			});
	}, lp.backstage.showError);

	// set config
	pg.form($config[0], function(){
		$config.find('.submit').attr('disabled', true);
	}, function(){
		$config.find('.submit').removeAttr('disabled');
	}, function(err){
		$config.find('.submit').removeAttr('disabled');
		lp.backstage.showError(err);
	});

	// set blacklist
	pg.form($dbBlacklist[0], function(){
		$dbBlacklist.find('.submit').attr('disabled', true);
	}, function(){
		$dbBlacklist.find('.submit').removeAttr('disabled');
	}, function(err){
		$dbBlacklist.find('.submit').removeAttr('disabled');
		lp.backstage.showError(err);
	});

	// restore
	var $restore = $settings.find('.settings_restore');
	$restore.find('input, select').removeAttr('disabled');
	pg.form($restore[0], function(){
		$restore.find('.submit').attr('disabled', true);
	}, function(){
		document.documentElement.scrollTop = 0;
	}, function(err){
		$dbBlacklist.find('.submit').removeAttr('disabled');
		lp.backstage.showError(err);
	});
});
