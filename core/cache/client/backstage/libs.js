// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
"use strict";lp.tableBuilder=function(t,e,a,n){for(var i=e.idCol||"_id",l=!!e.editMore,d=!!n,p=!e.noRemove,o={},r=function(t,e){o[t]?o[t].push(e):o[t]=[e]},c=function(t){var e=o[t];if(e){for(var a=[],n=1;n<arguments.length;n++)a.push(arguments[n]);for(var n=0;n<e.length;n++)e[n].apply(L,a)}},u=lp.tableBuilder.i18n,s=$('<div><div class="errors"></div><table cellpadding="0" cellspacing="0" border="0" class="lp_table"><thead></thead><tbody></tbody><tfoot></tfoot></table></div>').appendTo(t),f=s.children("table"),h=(f.children("thead"),f.children("tbody")),v=f.children("tfoot"),b=$("<tr></tr>").appendTo("thead"),_=0,T=0;T<a.length;T++){var g=a[T];if("extra"!==g.type){_++;var m=$("<th></th>").text(g.name).appendTo(b);"hidden"===g.type&&m.hide()}}var y=$('<tr><th colspan="'+_+'" class="lp_table_navi"></th></tr>').appendTo(v).find("th");d&&$('<div class="lp_table_action"><input type="button" class="lp_table_add" value="+"></div>').appendTo(y);var w=$('<div class="lp_table_page"></div>').appendTo(y),x=!1,I=function(){x=!0,h.fadeTo(200,.5),v.find("input").attr("disabled",!0)},k=function(){x=!1,h.fadeTo(200,1),v.find("input").removeAttr("disabled")};v.on("click",".lp_table_add",function(){if(!x){var t=h.children(".lp_table_add_row");t.length?t.focus():C.call(R(n[i]||"",n).addClass("lp_table_add_row").hide().fadeIn(200)[0])}});var D=function(){if(this.lpTableEditing){var t=this;t.lpTableEditing=!1;var e=$(t).next().andSelf();e.children("td").each(function(){$(this).text(this.lpTableData)})}},C=function(){if(!x&&!this.lpTableEditing){if(z)return void c("click",unescape($(this).attr("rowId")));var t=this;t.lpTableEditing=!0;var e=unescape($(t).attr("rowId")),a=$(t).next().andSelf();a.children("td").each(function(){var t=this.lpTableColId,e=this.lpTableInput;if("object"==typeof e){var n=$('<select name="'+t+'"></select>'),i="";for(var l in e)$('<option value="'+l+'"></option>').text(e[l]).appendTo(n),e[l]===this.lpTableData&&(i=l);n.val(i)}else if("password"===e)var n=$('<input type="password" name="'+t+'">');else if("hidden"===e)var n=$('<input type="hidden" name="'+t+'">').val(this.lpTableData);else if("add"!==e||a.hasClass("lp_table_add_row"))if(e===!1)var n=$("<span></span>").text(this.lpTableData);else var n=$('<input type="text" name="'+t+'">').val(this.lpTableData);else var n=$("<span></span>").text(this.lpTableData).add($('<input type="hidden" name="'+t+'">').val(this.lpTableData));$(this).html("").append(n)});var n=function(){var t={};return a.find("[name]").each(function(){for(var e=$(this).attr("name").split(/\./g),a=t;e.length>1;){var n=e.shift();"undefined"==typeof a[n]&&(a[n]={}),a=a[n]}a[e[0]]=$(this).val()}),t},i=function(t){a.find("input, select, textarea").attr("disabled",!0),d.slideUp(200,function(){t&&t()})},d=$('<div class="lp_table_edit_btn"></div>').appendTo(a.eq(1).children());if(a.hasClass("lp_table_add_row"))$('<input type="button" value="'+u("Add")+'">').click(function(){x||(i(),c("add",n()))}).appendTo(d),$('<input type="button" value="'+u("Cancel")+'">').click(function(){x||a.fadeOut(200,function(){a.remove()})}).appendTo(d);else{if(l)var o=u("Details");else var o=u("Save");if($('<input type="button" value="'+o+'">').click(function(){x||(i(),c("change",n(),e))}).appendTo(d),$('<input type="button" value="'+u("Cancel")+'">').click(function(){x||i(function(){D.call(t)})}).appendTo(d),p)var r=$('<input type="button" class="lp_table_edit_btn_right" value="'+u("No, thanks.")+'">').click(function(){x||(s.hide(),r.hide(),f.fadeIn(200))}).hide().appendTo(d),s=$('<input type="button" class="lp_table_edit_btn_right" value="'+u("Yes, remove!")+'">').click(function(){x||(i(),c("remove",e))}).hide().appendTo(d),f=$('<input type="button" class="lp_table_edit_btn_right" value="'+u("Remove")+'">').click(function(){x||(f.hide(),r.fadeIn(200),s.fadeIn(200))}).appendTo(d)}}};h.on("click",".lp_table_row",C);var A=function(){var t=h.children(".lp_table_add_row");t.find(".lp_table_edit_btn").slideDown(200,function(){t.find("input, select, textarea").removeAttr("disabled")})},E=function(t){var e=h.find('[rowId="'+escape(t)+'"]');e.find(".lp_table_edit_btn").slideDown(200,function(){e.find("input, select, textarea").removeAttr("disabled")})},R=function(t,e){var n=h.children('[rowId="'+escape(t)+'"]').html("");n.length||(n=$('<tr class="lp_table_row" rowId="'+escape(t)+'"></tr><tr rowId="'+escape(t)+'" class="lp_table_extra"></tr>').appendTo(h));for(var i=0;i<a.length;i++){for(var l=a[i],d=e,p=l.id.split(/\./g);p.length&&d;)d=d[p.shift()];if("object"==typeof l.input&&(d=l.input[d]),"extra"===l.type)var o=$('<td colspan="'+_+'"></td>').text(d||"").appendTo(n[1]);else{var o=$("<td></td>").text(d||"").appendTo(n[0]);"hidden"===l.type&&o.hide()}o.prop("lpTableColId",l.id).prop("lpTableInput",l.input).prop("lpTableData",d||"")}return n[0].lpTableEditing=!1,n},S=function(t){h.html("");for(var e=0;e<t.length;e++){var a=t[e],n=a[i];R(n,a)}},B=function(t,e){return R(t,e).hide().fadeIn(200),this},j=function(t,e){return h.find(".lp_table_add_row").remove(),B(t,e)},M=function(t){var e=h.children('[rowId="'+escape(t)+'"]').fadeOut(200,function(){e.remove()})},N=0,O=0,q=function(){w.html('<input type="button" class="lp_table_prev" value="&lt;"> <input type="text" class="lp_table_page_num"> / '+O+' <input type="button" class="lp_table_next" value="&gt;">'),w.find(".lp_table_page_num").val(N+1).css("width",String(O).length+"em")};w.on("change",".lp_table_page_num",function(){var t=Number(this.value);0>=t||t>O?this.value=N+1:(N=t-1,q(),I(),c("data",N))}),w.on("click",".lp_table_prev",function(){x||N>0&&(N--,q(),I(),c("data",N))}),w.on("click",".lp_table_next",function(){x||O-1>N&&(N++,q(),I(),c("data",N))});var P=function(t,e){return"undefined"!=typeof e&&(N=e,q()),S(t),k(),this},U=function(t,e){return"undefined"!=typeof t&&(N=t),"undefined"!=typeof e&&(O=e),q(),I(),setTimeout(function(){c("data",N)},0),this},Y=function(t){return O=t||0,q(),this},z=!1,F=function(t){return z=!0,r("click",t),this},G=function(t){return r("change",t),this},H=function(t){return r("remove",t),this},J=function(t){return r("add",t),this},K=function(t){return r("data",t),this},L={setRow:B,addRow:j,removeRow:M,set:P,setPage:U,setTotal:Y,enableAdd:A,enableModify:E,click:F,change:G,remove:H,add:J,data:K};return L},lp.tableBuilder.i18n=function(t){return t};
// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
"use strict";!function(){var i={};lp.registerDriver=function(r,n){i[r]=n},lp.listDrivers=function(r){var n=[];for(var t in i){if(i[t].permission){var e=i[t].permission;if("admin"===e&&"admin"!==r)continue;if("editor"===e&&"admin"!==r&&"editor"!==r)continue;if("writer"===e&&"admin"!==r&&"editor"!==r&&"writer"!==r)continue}n.push({id:t,name:i[t].name})}return n.sort(function(r,n){return(i[n.id].priority||0)-(i[r.id].priority||0)}),n},lp.driverName=function(r){return i[r]?i[r].name:""},lp.driverEditor=function(r,n,t,e){return i[r]&&i[r].editor?i[r].editor(n,t,e):void 0}}();