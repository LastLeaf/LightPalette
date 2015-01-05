// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	$('body').html(pg.tmpl.init());

	var addFormEvent = function(){
		$('#installGuide>.error').hide();
		pg.form($('#installGuide>form')[0], function(){}, function(nextStep, obj){
			$('#installGuide').html(pg.tmpl[nextStep](obj));
			if(nextStep === 'success') {
				pg.rpc('manager:restart');
				pg.on('socketConnect', function(){
					location.href = '/';
				});
			}
			addFormEvent();
		}, function(err){
			$('#installGuide>.error').text(pg.tmpl.error[err || '']).fadeTo(0, 0).fadeTo(250, 1);
		});
	};
	addFormEvent();
});
