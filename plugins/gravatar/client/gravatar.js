// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(){
	// gravatar helper
	lp.avatarUrl = function(userInfo, size, def){
		var url = 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(userInfo.email) + '?d=' + encodeURIComponent(def || 'mm');
		if(size) url += '&s=' + size;
		return url;
	};
});
