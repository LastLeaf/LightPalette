fw._tmpls({main:function(t,s,i,o,n){return this.compilerInfo=[4,">= 1.0.0"],i=this.merge(i,t.helpers),n=n||{},'\n	<div class="stat_options">\n		Post Visits in\n		<select class="stat_time">\n			<option value="3600">1 hour</option>\n			<option value="86400">24 hours</option>\n			<option value="259200" selected>3 days</option>\n			<option value="604800" selected>7 days</option>\n			<option value="2592000">30 days</option>\n			<option value="7776000">90 days</option>\n			<option value="31536000">365 days</option>\n			<option value="0">All History</option>\n		</select>\n	</div>\n	<div class="stat_title"></div>\n	<div class="stat_meta"></div>\n	<div class="table"></div>\n'},statMeta:function(t,s,i,o,n){this.compilerInfo=[4,">= 1.0.0"],i=this.merge(i,t.helpers),n=n||{};var a,e,l="",p="function",v=this.escapeExpression;return l+="\n	",(e=i.visits)?a=e.call(s,{hash:{},data:n}):(e=s&&s.visits,a=typeof e===p?e.call(s,{hash:{},data:n}):e),l+=v(a)+" Visits from ",(e=i.visitors)?a=e.call(s,{hash:{},data:n}):(e=s&&s.visitors,a=typeof e===p?e.call(s,{hash:{},data:n}):e),l+=v(a)+" Visitors\n"}});