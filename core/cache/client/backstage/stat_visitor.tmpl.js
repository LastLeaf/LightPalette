fw._tmpls({main:function(t,i,n,o,s){return this.compilerInfo=[4,">= 1.0.0"],n=this.merge(n,t.helpers),s=s||{},'\n	<div class="stat_options">\n		Visits in\n		<select class="stat_time">\n			<option value="3600">1 hour</option>\n			<option value="86400">24 hours</option>\n			<option value="259200" selected>3 days</option>\n			<option value="604800" selected>7 days</option>\n			<option value="2592000">30 days</option>\n			<option value="7776000">90 days</option>\n			<option value="31536000">365 days</option>\n			<option value="0">All History</option>\n		</select>\n	</div>\n	<div class="stat_meta"></div>\n	<div class="table"></div>\n'},statMeta:function(t,i,n,o,s){this.compilerInfo=[4,">= 1.0.0"],n=this.merge(n,t.helpers),s=s||{};var a,e,l="",p="function",d=this.escapeExpression;return l+="\n	",(e=n.visits)?a=e.call(i,{hash:{},data:s}):(e=i&&i.visits,a=typeof e===p?e.call(i,{hash:{},data:s}):e),l+=d(a)+" Visits by Visitor ID ",(e=n.id)?a=e.call(i,{hash:{},data:s}):(e=i&&i.id,a=typeof e===p?e.call(i,{hash:{},data:s}):e),l+=d(a)+"\n"}});