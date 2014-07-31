// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	lp.initDriver('presentation', function(args){
		var postId = args.id;

		// init structure
		var div = document.getElementById('driver-presentation');
		var contentDiv = document.createElement('div');
		contentDiv.className = 'post_presentation_content';
		div.parentElement.insertBefore(contentDiv, div);
		div.parentElement.removeChild(div);
		div.style.display = 'block';
		var iframe = document.createElement('iframe');
		iframe.style.display = 'block';
		iframe.style.width = '100%';
		iframe.style.margin = '0';
		iframe.style.padding = '0';
		iframe.style.border = '0 none';
		iframe.style.left = '0px';
		iframe.style.right = '0px';
		iframe.style.top = '0px';
		iframe.style.bottom = '0px';
		iframe.setAttribute('allowfullscreen', '');
		iframe.setAttribute('mozallowfullscreen', '');
		iframe.setAttribute('msallowfullscreen', '');
		iframe.setAttribute('webkitallowfullscreen', '');

		// full screen controller
		var requestFullScreen = document.body.requestFullScreen || document.body.mozRequestFullScreen || document.body.msRequestFullScreen || document.body.webkitRequestFullScreen;
		var cancelFullScreen = document.cancelFullScreen || document.mozCancelFullScreen || document.msCancelFullScreen || document.webkitCancelFullScreen;
		var iframeIsFullScreen = function(){
			var isFullScreen = iframe.contentWindow.document.isFullScreen;
			if(typeof(isFullScreen) === 'boolean') return isFullScreen;
			var isFullScreen = iframe.contentWindow.document.mozFullScreen;
			if(typeof(isFullScreen) === 'boolean') return isFullScreen;
			var isFullScreen = iframe.contentWindow.document.msIsFullScreen;
			if(typeof(isFullScreen) === 'boolean') return isFullScreen;
			var isFullScreen = iframe.contentWindow.document.webkitIsFullScreen;
			if(typeof(isFullScreen) === 'boolean') return isFullScreen;
			return (iframe.style.position !== 'static');
		};
		var iframeFullScreen = function(){
			if(requestFullScreen) {
				requestFullScreen.call(iframe.contentWindow.document.body);
			} else {
				iframe.style.position = 'fixed';
				iframe.style.height = '100%';
			}
		};
		var iframeCancelFullScreen = function(){
			if(cancelFullScreen) {
				cancelFullScreen.call(iframe.contentWindow.document);
			} else {
				iframe.style.position = 'static';
				iframe.style.height = iframe.clientWidth*9/16 + 'px';
			}
		};

		// init content
		contentDiv.appendChild(iframe);
		if(requestFullScreen) {
			iframe.style.height = iframe.clientWidth*9/16 + 'px';
		}
		iframeCancelFullScreen();
		iframe.contentWindow.document.open();
		iframe.contentWindow.document.write(pg.tmpl.presentation(div.outerHTML));
		iframe.contentWindow.pg = fw.getPage();
		iframe.contentWindow.postId = postId;
		iframe.contentWindow.toggleFullScreen = function(){
			if(iframeIsFullScreen())
				iframeCancelFullScreen();
			else
				iframeFullScreen();
		};
		iframe.contentWindow.document.close();
		iframe.focus();
	});
});