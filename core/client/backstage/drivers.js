// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	pg.on('childUnload', lp.backstage.showLoading);
	pg.on('childLoadStart', lp.backstage.updateTabStyle);
});
