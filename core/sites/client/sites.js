// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var LIST_LEN = 10;

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = lp.tableBuilder.i18n = tmpl.i18n;

	var showSitesTable = function(){
		$('#content').html(tmpl.sitesTable());
		var showError = function(err){
			$('#sitesTableError').text(tmpl.error[err || '']).fadeTo(0, 0).fadeTo(250, 1);
		};
		$('#sitesTableError').click(function(){
			$(this).hide();
		});

		// add button events
		$('#restart').click(function(e){
			e.preventDefault();
			pg.rpc('manager:restartFw', function(){}, function(err){
				showError(err);
			});
		});
		$('#modifyPassword').click(function(e){
			e.preventDefault();
			// modify password
			var $form = $('#content').html(tmpl.setPassword({modify: true})).find('form');
			pg.form($form[0], function(){
				var str = $form.find('#password').val();
				if(!str || str !== $form.find('#passwordRetype').val()) {
					$form.find('#passwordRetype').val('').focus();
					return false;
				}
				$form.find('[name=password]').val( CryptoJS.SHA256(str + ' | LightPalette') );
				str = $form.find('#oldPassword').val();
				$form.find('[name=oldPassword]').val( CryptoJS.SHA256(str + ' | LightPalette') );
				$form.find('.submit').attr('disabled', true);
			}, function(){
				showSitesTable();
			}, function(err){
				$form.find('.submit').removeAttr('disabled');
				$form.find('.error').text(tmpl.error[err || '']).fadeTo(0, 0).fadeTo(250, 1);
			});
		});
		$('#logout').click(function(e){
			e.preventDefault();
			fw.reload(1);
		});

		// build table
		var table = lp.tableBuilder($('#sitesTable'), {idCol: '_id'}, [
			{ id: '_id', name: _('Site ID'), input: 'add' },
			{ id: 'title', name: _('Site Title') },
			{ id: 'permission', name: _('Permission'), input: {
				'': _('None'),
				all: _('As Sites Manager')
			} },
			{ id: 'status', name: _('Status'), input: {
				disabled: _('Disabled'),
				enabled: _('Enabled')
			} },
			{ id: 'hosts', placeholder: _('Domain Names'), type: 'extra' }
		], {
			status: 'disabled'
		})
		.data(function(page){
			pg.rpc('manager:listSites', {from: page*LIST_LEN, count: LIST_LEN}, function(r){
				table.setTotal(Math.ceil(r.total/LIST_LEN));
				var rows = r.rows;
				for(var i=0; i<rows.length; i++)
					rows[i].hosts = rows[i].hosts.join(' ');
				table.set(rows);
			}, function(err){
				showError(err);
			});
		})
		.setPage(0, 1);

		// table operations
		table.add(function(data){
			pg.rpc('manager:updateSite', data, true, function(row){
				row.hosts = row.hosts.join(' ');
				table.addRow(row._id, row);
			}, function(err){
				showError(err);
				table.enableAdd();
			});
		});
		table.change(function(data){
			pg.rpc('manager:updateSite', data, function(row){
				row.hosts = row.hosts.join(' ');
				table.setRow(row._id, row);
			}, function(err){
				showError(err);
				table.enableModify(data._id);
			});
		});
		table.remove(function(_id){
			pg.rpc('manager:deleteSite', {_id: _id}, function(){
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
				$form.find('input:first').focus();
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
					fw.reload(1);
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
