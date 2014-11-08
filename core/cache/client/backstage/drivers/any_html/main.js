// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
"use strict";fw.main(function(n){var i=n.tmpl,t=i.i18n;lp.registerDriver("any_html",{name:t("Any HTML"),priority:0,permission:"admin",editor:function(n,t){$(n).html(i.anyHtml(t));return{get:function(){}}}})});
