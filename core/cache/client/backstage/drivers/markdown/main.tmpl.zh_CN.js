fw._tmpls({i18n:{"Markdown Doc":"Markdown文档"},markdown:function(e,n,r,a,t){function i(e,n){var a,t="";return t+='\n			<div class="driver_use_html">\n				<input type="checkbox" id="driver_use_html_checkbox" ',a=r["if"].call(e,(a=e&&e.driver,null==a||a===!1?a:a.enableHtml),{hash:{},inverse:d.noop,fn:d.program(2,l,n),data:n}),(a||0===a)&&(t+=a),t+='> <label for="driver_use_html_checkbox">允许HTML标签（<b>危险</b> 不要勾选此项，除非你知道会有怎样的潜在危险。）</label>\n			</div>\n		'}function l(){return"checked"}this.compilerInfo=[4,">= 1.0.0"],r=this.merge(r,e.helpers),t=t||{};var o,c="",d=this,s="function",v=this.escapeExpression;return c+='\n	<div class="markdown">\n		',o=r["if"].call(n,n&&n.admin,{hash:{},inverse:d.noop,fn:d.program(1,i,t),data:t}),(o||0===o)&&(c+=o),c+='\n		<div class="driver_abstract">\n			<textarea placeholder="摘要">'+v((o=n&&n.driver,o=null==o||o===!1?o:o["abstract"],typeof o===s?o.apply(n):o))+'</textarea>\n		</div>\n		<div class="driver_content">\n			<textarea placeholder="内容">'+v((o=n&&n.driver,o=null==o||o===!1?o:o.content,typeof o===s?o.apply(n):o))+"</textarea>\n		</div>\n	</div>\n"}});