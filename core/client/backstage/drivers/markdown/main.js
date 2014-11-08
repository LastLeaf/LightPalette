// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	lp.registerDriver('markdown', {
		name: _('Markdown Doc'),
		priority: 3000,
		editor: function(div, data, userInfo){
			var $div = $(div).html(tmpl.markdown({
				driver: data.driver,
				admin: userInfo.type === 'admin'
			}));
			return {
				get: function(){
					return {
						driver: {
							enableHtml: $('.markdown .driver_use_html input').prop('checked'),
							abstract: $('.markdown .driver_abstract textarea').val(),
							content: $('.markdown .driver_content textarea').val()
						}
					};
				}
			};
		}
	});
});
