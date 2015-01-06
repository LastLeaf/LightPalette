// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	pg.rpc('install:checkStatus', function(result){
		if(result === 'success') fw.go('/sites');
		else fw.go('/install');
	});
});
