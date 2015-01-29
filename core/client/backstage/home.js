// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var showPage = function(){
		if(pg.destroyed) return;
		var userInfo = lp.backstage.userInfo;
		if(!userInfo._id) {

			// login page
			var $content = $('#content').html(tmpl.login());
			// section switch
			$content.find('.section_title a').click(function(e){
				e.preventDefault();
				var $section = $(this).closest('.section');
				if(!$section.hasClass('section_folded')) return;
				$section.parent().children('.section:not(.section_folded)').addClass('section_folded')
					.children('form').slideUp(200, function(){
						$section.removeClass('section_folded').children('form').slideDown(200);
					});
			});
			$content.find('.section_folded>form').hide();
			// submit forms
			$content.find('form').each(function(){
				var $form = $(this);
				pg.form(this, function(){
					if($form.find('.passwordRe').length) {
						if($form.find('.passwordRe').val() !== $form.find('.password').val()) {
							$form.find('.passwordRe').val('').focus();
							return false;
						}
					}
					if($form.find('.password').val())
						$form.find('[name=password]').val(
							CryptoJS.SHA256($form.find('[name=_id]').val().toLowerCase() +'|'+ $form.find('.password').val())
						);
					$form.find('[type=submit]').prop('disabled', true);
				}, function(){
					location.pathname = '/backstage/home';
				}, function(err){
					$form.find('[type=submit]').prop('disabled', false);
					lp.backstage.showError(err);
				});
			});

			return;
		}

		var latestGot = function(posts, comments){
			// common page
			var $content = $('#content').html(tmpl.main({
				username: userInfo._id,
				displayName: userInfo.displayName,
				type: userInfo.type,
				email: userInfo.email,
				url: userInfo.url,
				description: userInfo.description,
				avatar: lp.avatarUrl(userInfo, 128),
				posts: posts,
				comments: comments,
			}));
			// main page content
			$content.find('.new_post').click(function(){
				fw.go('/backstage/post');
			});
			// user settings
			var $user = $content.children('.home_user');
			var $form = $user.find('.user_info').on('click', '.info', function(){
				$form.find('.info').hide();
				$form.find('input, textarea').css('display', 'block');
			});
			pg.form($form[0], function(){
				$form.find('.error').html('');
				$form.find('.submit').attr('disabled', true);
			}, function(){
				location.reload();
			}, function(err){
				$form.find('.submit').attr('disabled', false);
				lp.backstage.showError(err);
			});
			var $pwdForm = $user.find('.user_password');
			$user.find('.modify_password').click(function(e){
				e.preventDefault();
				$(this).hide();
				$pwdForm.fadeIn(200);
			});
			pg.form($pwdForm[0], function(){
				if($pwdForm.find('.new').val() !== $pwdForm.find('.newRe').val()) {
					$pwdForm.find('.newRe').val('').focus();
					return false;
				}
				$pwdForm.find('[name=password]').val(CryptoJS.SHA256(userInfo._id.toLowerCase() +'|'+ $pwdForm.find('.new').val()));
				$pwdForm.find('[name=original]').val(CryptoJS.SHA256(userInfo._id.toLowerCase() +'|'+ $pwdForm.find('.original').val()));
				$pwdForm.find('.error').html('');
				$pwdForm.find('.submit').attr('disabled', true);
			}, function(){
				$pwdForm.find('.submit').attr('disabled', false);
				$pwdForm.hide();
				$user.find('.modify_password').fadeIn(200);
			}, function(err){
				$pwdForm.find('.submit').attr('disabled', false);
				lp.backstage.showError(err);
			});
		};

		// read hot posts and resent comments
		pg.rpc('comment:list', {depth: 1, desc: 'yes', from: 0, count: 10}, function(comments){
			pg.rpc('post:list', {from: 0, count: 10}, function(posts){
				latestGot(posts, comments);
			}, function(err){
				if(err) lp.backstage.showError(err);
			});
		}, function(err){
			if(err) lp.backstage.showError(err);
		});
	};

	if(lp.backstage.userInfo) {
		showPage();
	} else {
		pg.parent.on('userInfoReady', showPage);
	}
});
