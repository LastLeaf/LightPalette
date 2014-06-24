// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	lp.registerDriver('presentation', {
		name: _('Presentation'),
		priority: 5000,
		editor: function(div, data){

			var $div = $(div).html(tmpl.presentation(data));

			// events
			return {
				get: function(){
					var abstract = $div.find('.driver_abstract textarea').val();
					var content = $div.find('.driver_content textarea').val().split(/<===>/g);
					return {
						driver: {
							abstract: abstract,
							content: content
						}
					};
				}
			};
		}
	});
});