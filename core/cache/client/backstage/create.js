// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
"use strict";fw.main(function(t){var n=t.tmpl,e=(n.i18n,function(){var e=lp.backstage.userInfo,r=$("#content").html(n.main(lp.listDrivers(e.type))).find("input");r.click(function(){var n=$(this),e=n.attr("driverId");r.attr("disabled",!0),t.rpc("post:create",{type:e},function(n){$("#content").html(t.parent.parent.tmpl.busy()),fw.go("/backstage/post/"+n)},function(t){lp.backstage.showError(t),r.removeAttr("disabled")})})});lp.backstage.userInfo?e():t.parent.on("userInfoReady",e)});