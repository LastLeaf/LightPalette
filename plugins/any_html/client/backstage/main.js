// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg, subm){
	var tmpl = subm.tmpl;
	var _ = tmpl.i18n;

	lp.backstage.driver('any_html', {
		name: _('Any HTML'),
		permission: 'admin',
		editor: function(div, data){
			var $div = $(div).html(tmpl.anyHtml(data));
			var originalData = data;
			return {
				get: function(){}
			};
		}
	});
});
