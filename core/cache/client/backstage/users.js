// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
"use strict";var USER_LIST_LEN=20;fw.main(function(r){var e=r.tmpl,o=e.i18n,a=$("#content").html(e.main()),t=a.find(".table"),i=lp.tableBuilder(t,{idCol:"_id"},[{id:"_id",name:o("Username"),input:"add"},{id:"displayName",name:o("Display Name")},{id:"type",name:o("Type"),input:{admin:o("admin"),editor:o("editor"),writer:o("writer"),contributor:o("contributor"),reader:o("reader"),disabled:o("disabled")}},{id:"email",name:o("Email")},{id:"url",name:o("URL")},{id:"password",name:o("Password"),input:"password"},{id:"description",type:"extra"}],{type:"reader"}).data(function(e){r.rpc("user:list",{from:e*USER_LIST_LEN,count:USER_LIST_LEN},function(r){i.setTotal(Math.ceil(r.total/USER_LIST_LEN));for(var e=r.rows,o=0;o<e.length;o++)e[o].password="******";i.set(e)},function(r){lp.backstage.showError(r)})}).setPage(0,1);i.add(function(e){e.password&&(e.password=CryptoJS.SHA256(e._id.toLowerCase()+"|"+e.password).toString()),r.rpc("user:set",e,!0,function(){e.password="******",i.addRow(e._id,e)},function(r){lp.backstage.showError(r),i.enableAdd()})}),i.change(function(e){e.password&&(e.password=CryptoJS.SHA256(e._id.toLowerCase()+"|"+e.password).toString()),r.rpc("user:set",e,!1,function(){e.password="******",i.setRow(e._id,e)},function(r){lp.backstage.showError(r),i.enableModify(e._id)})}),i.remove(function(e){r.rpc("user:remove",{_id:e},function(){i.removeRow(e)},function(r){lp.backstage.showError(r),i.enableModify(e)})})});