// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var LIST_LEN = 20;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = lp.tableBuilder.i18n = tmpl.i18n;

	var showSitesTable = function(){
		$('#content').html(tmpl.sitesTable());
		// build table
		var table = lp.tableBuilder($('#sitesTable'), {idCol: '_id'}, [
			{ id: '_id', name: _('Site ID'), input: 'add' },
			{ id: 'title', name: _('Site Title') },
			{ id: 'status', name: _('Status'), input: {
				started: _('Started'),
				stopped: _('Stopped')
			} },
			{ id: 'hosts', type: 'extra' }
		], {
			type: 'stopped'
		})
		.data(function(page){
			pg.rpc('manager:listSites', {from: page*LIST_LEN, count: LIST_LEN}, function(r){
				table.setTotal(Math.ceil(r.total/LIST_LEN));
				var rows = r.rows;
				table.set(rows);
			}, function(err){
				showError(err);
			});
		})
		.setPage(0, 1);

		// table operations
		table.add(function(data){
			pg.rpc('manager:createSite', data, function(){
				table.addRow(data._id, data);
			}, function(err){
				showError(err);
				table.enableAdd();
			});
		});
		table.change(function(data){
			pg.rpc('manager:modifySite', data, function(){
				table.setRow(data._id, data);
			}, function(err){
				showError(err);
				table.enableModify(data._id);
			});
		});
		table.remove(function(_id){
			pg.rpc('manager:removeSite', {_id: _id}, function(){
				table.removeRow(_id);
			}, function(err){
				showError(err);
				table.enableModify(_id);
			});
		});
	};

	document.body.innerHTML = tmpl.init();
	pg.on('socketConnect', function(){
		pg.rpc('manager:checkStatus', function(result){
			showSitesTable();
		}, function(err){
			if(err === 'noPermission') {
				// require password
				var $form = $('#content').html(tmpl.requirePassword()).find('form');
				pg.form($form[0], function(){
					var str = $form.find('#password').val();
					if(!str) return false;
					$form.find('[name=password]').val( CryptoJS.SHA256(str + ' | LightPalette') );
					$form.find('.submit').attr('disabled', true);
				}, function(){
					showSitesTable();
				}, function(err){
					$form.find('.submit').removeAttr('disabled');
					$form.find('.error').text(tmpl.error[err || '']).fadeTo(0, 0).fadeTo(250, 1);
				});
			} else if(err === 'passwordNotSet') {
				// set password
				var $form = $('#content').html(tmpl.setPassword()).find('form');
				pg.form($form[0], function(){
					var str = $form.find('#password').val();
					if(!str || str !== $form.find('#passwordRetype').val()) {
						$form.find('#passwordRetype').val('').focus();
						return false;
					}
					$form.find('[name=password]').val( CryptoJS.SHA256(str + ' | LightPalette') );
					$form.find('.submit').attr('disabled', true);
				}, function(){
					$('#content').html(tmpl.requirePassword());
				}, function(err){
					$form.find('.submit').removeAttr('disabled');
					$form.find('.error').text(tmpl.error[err || '']).fadeTo(0, 0).fadeTo(250, 1);
				});
			} else if(err === 'notInstalled') {
				// go to install page
				fw.go('/install');
			}
		});
	});
	pg.on('socketDisconnect', function(){
		document.body.innerHTML = tmpl.init();
	});
});
