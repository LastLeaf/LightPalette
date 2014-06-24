// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	lp.initDriver('presentation', function(){
		var div = document.getElementById('driver-presentation');
		var iframe = document.createElement('iframe');
		iframe.style.width = '100%';
		iframe.style.margin = '0';
		iframe.style.padding = '0';
		iframe.style.border = '0';
		div.parentElement.insertBefore(iframe, div);
		iframe.style.height = iframe.clientWidth*9/16 + 'px';
		iframe.contentWindow.document.open();
		iframe.contentWindow.document.write(pg.tmpl.presentation(div.outerHTML));
		iframe.contentWindow.document.close();
		div.parentElement.removeChild(div);
	});
});