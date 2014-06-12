// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	var showPage = function(){
		if(pg.destroyed) return;
		var userInfo = pg.parent.userInfo;
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

		} else {

			// common page
			var $content = $('#content').html(tmpl.main({
				username: userInfo._id,
				displayName: userInfo.displayName,
				type: userInfo.type,
				email: userInfo.email,
				url: userInfo.url,
				description: userInfo.description,
				avatar: (userInfo.avatar ? userInfo.avatar+'/128.png' : lp.gravatarUrl(userInfo.email, 128)),
				avatarDel: !!userInfo.avatar
			}));
			// user settings
			var $user = $content.children('.home_user');
			$user.find('.avatar_file input').change(function(){
				// read, convert and send image
				var file = this.files[0];
				var url = URL.createObjectURL(file);
				var img = document.createElement('img');
				img.onload = function(){
					URL.revokeObjectURL(url);
					var canvas = document.createElement('canvas');
					canvas.width = canvas.height = 128;
					canvas.getContext('2d').drawImage(img, 0, 0, 128, 128);
					$user.find('.avatar_error').html('');
					$('.avatar').fadeTo(200, 0.5);
					pg.rpc('user:avatar', canvas.toDataURL('image/png'), function(){
						location.reload();
					}, function(err){
						lp.backstage.showError(err);
					});
				};
				img.src = url;
			});
			$user.find('.avatar_del a').click(function(e){
				e.preventDefault();
				$(this).hide();
				$('.avatar').fadeTo(200, 0.5);
				pg.rpc('user:avatar', '', function(){
					location.reload();
				}, function(err){
					lp.backstage.showError(err);
				});
			});
			$user.find('.avatar').click(function(){
				$user.find('.avatar_file input').click();
			});
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

		}
	};

	if(pg.parent.userInfo) {
		showPage();
	} else {
		pg.parent.on('userInfoReady', showPage);
	}
});