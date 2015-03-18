// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg, subm){
	var tmpl = subm.tmpl;
	var _ = tmpl.i18n;

	lp.backstage.driver('article', {
		name: _('Article'),
		editor: function(div, data){

			var tinymceId = 'tinymce-' + new Date().getTime();
			var $div = null;
			pg.require('/plugins/article/lib/tinymce.js', function(){
				// init editor in div
				if(!data.driver) data.driver = {};
				$div = $(div).html(tmpl.article({
					tinymceId: tinymceId,
					content: data.content,
					abstractManual: data.driver.abstract || ''
				}));
				tinymce.init({
					selector: '#' + tinymceId,
					theme: 'modern',
					height: 400,
					plugins: [
						'anchor charmap code contextmenu hr image link lists paste searchreplace table textcolor'
					],
					menubar: 'edit insert view format table tools',
					toolbar: 'styleselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat',
					statusbar: true,
					style_formats: [
						{title: 'Heading 1', block: 'h1'},
						{title: 'Heading 2', block: 'h2'},
						{title: 'Heading 3', block: 'h3'},
						{title: 'Blockquote', block: 'blockquote'},
						{title: 'Pre', block: 'pre'},
					],
					content_css: '/~client/plugins/article/lib/skins/tinymce.css',
					language: fw.language,
					paste_as_text: true,
					paste_word_valid_elements: ([ 'h1', 'h2', 'h3', 'img', 'blockquote', 'p', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'sup', 'sub', 'div', 'span' ]).join(',')
				});
				// abstract
				$div.find('.driver_abstract_enable').change(function(){
					var enabled = ($(this).val() !== 'auto');
					if(enabled) $div.find('.driver_abstract_manual').fadeIn(200);
					else $div.find('.driver_abstract_manual').fadeOut(200);
				}).val(data.driver.abstractType || 'auto').change();
			});

			// events
			return {
				get: function(){
					var content = tinymce.get(tinymceId).getContent();
					var abstractType = $div.find('.driver_abstract_enable').val();
					var abstract = $div.find('.driver_abstract_manual').val();
					if(abstractType === 'auto') {
						// auto abstract
						abstract = $(content).eq(0).prop('outerHTML');
					}
					return {
						content: content,
						driver: {
							abstract: abstract,
							abstractType: abstractType
						}
					};
				}
			};

		}
	});
});
