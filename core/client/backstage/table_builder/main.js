// Copyright 2015 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg, subm, cb){
	return function($div, options, colDefine, addDef){
		return subm.import('table_builder.js')(function(str){
			return subm.tmpl.translation[str] || str;
		}, $div, options, colDefine, addDef);
	};
});
