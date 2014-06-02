// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var initPage = function(post){

		// show content
		var $content = $('#content').html(tmpl.main());
		var $form = $content.find('.editor');
		$form.find('[name]').each(function(){
			var name = $(this).attr('name');
			if(post[name]) this.value = post[name];
		});
		var editor = lp.driverEditor(post.type, $content.find('.driver')[0], post);

		// save
		var $save = $content.find('.editor_save').click(function(){
			$form.submit();
		});
		$form.submit(function(e){
			e.preventDefault();
			// collect args
			var args = {
				_id: post._id
			};
			var dynArgs = editor.get();
			var elems = $form[0].elements;
			for(var i=0; i<elems.length; i++)
				if(elems[i].name)
					args[elems[i].name] = elems[i].value;
			for(var k in dynArgs)
				args[k] = dynArgs[k];
			// rpc
			$save.prop('disabled', true);
			pg.rpc($form.attr('action') + ':' + $form.attr('method'), args, function(){
				$save.prop('disabled', false);
			}, function(err){
				$save.prop('disabled', false);
				lp.backstage.showError(err);
			});
			$save.prop('disabled', true);
		});
	};

	// get post information
	pg.rpc('post:get', {_id: fw.getArgs()['*']}, function(r){
		initPage(r);
	}, function(err){
		lp.backstage.showError(err);
	});
});