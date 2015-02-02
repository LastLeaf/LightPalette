// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	$('body').html(pg.tmpl.init());

	var addFormEvent = function(){
		$('#installGuide>.error').hide();
		pg.form($('#installGuide>form')[0], function(){
			$('#installGuide .submit').attr('disabled', true);
		}, function(nextStep, obj){
			$('#installGuide').html(pg.tmpl[nextStep](obj));
			if(nextStep === 'success') {
				pg.rpc('manager:restart', function(){}, function(err){
					if(err) location.href = '/';
				});
				pg.on('socketConnect', function(){
					fw.reload();
				});
				setTimeout(function(){
					pg.rpc('install:checkStatus');
				}, 3000);
			}
			addFormEvent();
		}, function(err){
			$('#installGuide .submit').removeAttr('disabled');
			$('#installGuide .error').text(pg.tmpl.error[err || '']).fadeTo(0, 0).fadeTo(250, 1);
		});
	};

	pg.rpc('install:checkStatus', function(status){
		if(status === 'success') {
			fw.go('/');
		} else {
			addFormEvent();
		}
	});
});
