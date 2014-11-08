// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	lp.registerDriver('any_html', {
		name: _('Any HTML'),
		priority: 0,
		permission: 'admin',
		editor: function(div, data){
			var $div = $(div).html(tmpl.anyHtml(data));
			return {
				get: function(){}
			};
		}
	});
});
