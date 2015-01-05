// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	$('body').html(pg.tmpl.init());
	//pg.rpc('server:passwordExists', function(exists){});
});
