/**
*
*   classy.js
*   Object-Oriented mini-framework for JavaScript
*   @version: 0.4
*
*   https://github.com/foo123/classy.js
*
**/!function(t,e,o,r){o=o?[].concat(o):[];var n,p=o.length,i=new Array(p),c=new Array(p),f=new Array(p);for(n=0;p>n;n++)i[n]=o[n][0],c[n]=o[n][1];if("object"==typeof module&&module.exports){if("undefined"==typeof module.exports[e]){for(n=0;p>n;n++)f[n]=module.exports[i[n]]||require(c[n])[i[n]];module.exports[e]=r.apply(t,f)}}else if("function"==typeof define&&define.amd)define(["exports"].concat(c),function(o){if("undefined"==typeof o[e]){for(var n=Array.prototype.slice.call(arguments,1),p=0,c=n.length;c>p;p++)f[p]=o[i[p]];o[e]=r.apply(t,f)}});else if("undefined"==typeof t[e]){for(n=0;p>n;n++)f[n]=t[i[n]];t[e]=r.apply(t,f)}}(this,"Classy",null,function(){var t=Array.prototype.slice,e=(Array.prototype.splice,Array.prototype.concat,Object.prototype.hasOwnProperty),o=Object.defineProperties,r=Object.prototype.toString,n=Object.create||function(t,e){var r,n=function(){};return n.prototype=t,r=new n,r.__proto__=t,o&&"undefined"!=typeof e&&o(r,e),r},p=function(e,o){return o=o||0,function(r){if(r){for(var n=e,p=o;p&&n;)n=n.$super,p--;if(p)return;if(n){var i,c=this;if(r="constructor"==r?n:n.prototype[r])return o++,i=r.apply(c,t.call(arguments,1)),o--,i}}}},i=function(){var o,n,p,i,c,f,a,l,s=t.call(arguments);for(n=s.shift()||{},o=s.length,l=0;o>l;l++)if(p=s[l],p&&"object"==typeof p)for(a in p)e.call(p,a)&&(f=p[a],i=r.call(f),c=typeof f,n[a]="number"==c||f instanceof Number?0+f:f&&("[object Array]"==i||f instanceof Array||"string"==c||f instanceof String)?f.slice(0):f);return n},c=function(t,e){t=t||Object,e=e||{};var o=e.constructor?e.constructor:function(){};return o.prototype=n(t.prototype),o.prototype=i(o.prototype,e),o.prototype.constructor=o.prototype.$class=o,o.prototype.$super=p(t),o.$super=t,o.$static=t.$static&&"object"==typeof t.$static?i(null,t.$static):null,o},f=Mixin=i,a=function(){var e=t.call(arguments),o=e.length,r=null;if(o>=2){var n=typeof e[0];n="function"==n?{Extends:e[0]}:"object"==n?e[0]:{Extends:Object};var p,a,l=e[1]||{},s=e[2]||null,u={},y=n.Extends||n.extends||Object,d=n.Implements||n.implements,m=n.Mixin||n.mixin;if(d=d?[].concat(d):null,m=m?[].concat(m):null)for(p=0,a=m.length;a>p;p++)m[p].prototype&&(u=Mixin(u,m[p].prototype));if(d)for(p=0,a=d.length;a>p;p++)d[p].prototype&&(u=f(u,d[p].prototype));r=c(y,i(u,l)),s&&"object"==typeof s&&(r.$static=i(r.$static,s))}else r=c(Object,e[0]);return r};return{VERSION:"0.4",Class:a,Extends:c,Implements:f,Mixin:Mixin,Create:n,Merge:i}});/**
*
*   A simple Regular Expression Analyzer
*   @version 0.2.4
*   https://github.com/foo123/regex-analyzer
*
**/!function(t,e,r,a){r=r?[].concat(r):[];var p,s=r.length,h=new Array(s),n=new Array(s),i=new Array(s);for(p=0;s>p;p++)h[p]=r[p][0],n[p]=r[p][1];if("object"==typeof module&&module.exports){if("undefined"==typeof module.exports[e]){for(p=0;s>p;p++)i[p]=module.exports[h[p]]||require(n[p])[h[p]];module.exports[e]=a.apply(t,i)}}else if("function"==typeof define&&define.amd)define(["exports"].concat(n),function(r){if("undefined"==typeof r[e]){for(var p=Array.prototype.slice.call(arguments,1),s=0,n=p.length;n>s;s++)i[s]=r[h[s]];r[e]=a.apply(t,i)}});else if("undefined"==typeof t[e]){for(p=0;s>p;p++)i[p]=t[h[p]];t[e]=a.apply(t,i)}}(this,"RegExAnalyzer",null,function(){var t="\\",e=/^\{\s*(\d+)\s*,?\s*(\d+)?\s*\}/,r=/^u([0-9a-fA-F]{4})/,a=/^x([0-9a-fA-F]{2})/,p={".":"MatchAnyChar","|":"MatchEither","?":"MatchZeroOrOne","*":"MatchZeroOrMore","+":"MatchOneOrMore","^":"MatchStart",$:"MatchEnd","{":"StartRepeats","}":"EndRepeats","(":"StartGroup",")":"EndGroup","[":"StartCharGroup","]":"EndCharGroup"},s={"\\":"EscapeChar","/":"/",0:"NULChar",f:"FormFeed",n:"LineFeed",r:"CarriageReturn",t:"HorizontalTab",v:"VerticalTab",b:"MatchWordBoundary",B:"MatchNonWordBoundary",s:"MatchSpaceChar",S:"MatchNonSpaceChar",w:"MatchWordChar",W:"MatchNonWordChar",d:"MatchDigitChar",D:"MatchNonDigitChar"},h=Object.prototype.toString,n=function(t,e){if(e&&(e instanceof Array||"[object Array]"==h.call(e)))for(var r=0,a=e.length;a>r;r++)t[e[r]]=1;else for(var r in e)t[r]=1;return t},i=function(t,e){t&&(t instanceof Array||"[object Array]"==h.call(t))&&(e=t[1],t=t[0]);var r,a,p=t.charCodeAt(0),s=e.charCodeAt(0);if(s==p)return[String.fromCharCode(p)];for(a=[],r=p;s>=r;++r)a.push(String.fromCharCode(r));return a},g=function(t){var e,r,a,p,s,h,o={},l={};if("Alternation"==t.type)for(a=0,p=t.part.length;p>a;a++)s=g(t.part[a]),o=n(o,s.peek),l=n(l,s.negativepeek);else if("Group"==t.type)s=g(t.part),o=n(o,s.peek),l=n(l,s.negativepeek);else if("Sequence"==t.type){for(a=0,p=t.part.length,r=t.part[a],h=a>=p||!r||"Quantifier"!=r.type||!r.flags.MatchZeroOrMore&&!r.flags.MatchZeroOrOne&&"0"!=r.flags.MatchMinimum;!h;)s=g(r.part),o=n(o,s.peek),l=n(l,s.negativepeek),a++,r=t.part[a],h=a>=p||!r||"Quantifier"!=r.type||!r.flags.MatchZeroOrMore&&!r.flags.MatchZeroOrOne&&"0"!=r.flags.MatchMinimum;p>a&&(r=t.part[a],"Special"!=r.type||"^"!=r.part&&"$"!=r.part||(r=t.part[a+1]||null),r&&"Quantifier"==r.type&&(r=r.part),r&&(s=g(r),o=n(o,s.peek),l=n(l,s.negativepeek)))}else if("CharGroup"==t.type)for(e=t.flags.NotMatch?l:o,a=0,p=t.part.length;p>a;a++)r=t.part[a],"Chars"==r.type?e=n(e,r.part):"CharRange"==r.type?e=n(e,i(r.part)):"UnicodeChar"==r.type||"HexChar"==r.type?e[r.flags.Char]=1:"Special"==r.type&&("D"==r.part?t.flags.NotMatch?o["\\d"]=1:l["\\d"]=1:"W"==r.part?t.flags.NotMatch?o["\\w"]=1:l["\\W"]=1:"S"==r.part?t.flags.NotMatch?o["\\s"]=1:l["\\s"]=1:e["\\"+r.part]=1);else"String"==t.type?o[t.part.charAt(0)]=1:"Special"!=t.type||t.flags.MatchStart||t.flags.MatchEnd?("UnicodeChar"==t.type||"HexChar"==t.type)&&(o[t.flags.Char]=1):"D"==t.part?l["\\d"]=1:"W"==t.part?l["\\W"]=1:"S"==t.part?l["\\s"]=1:o["\\"+t.part]=1;return{peek:o,negativepeek:l}},o=function(t,e){t&&this.setRegex(t,e)};return o.VERSION="0.2.4",o.getCharRange=i,o.prototype={constructor:o,VERSION:o.VERSION,regex:null,groupIndex:null,pos:null,flags:null,parts:null,getCharRange:o.getCharRange,getPeekChars:function(){var t,e,r,a,s=this.flags&&this.flags.i,h=g(this.parts);for(t in h){a={},r=h[t];for(e in r)"\\d"==e?(delete r[e],a=n(a,i("0","9"))):"\\s"==e?(delete r[e],a=n(a,["\f","\n","\r","	",""," ","\u2028","\u2029"])):"\\w"==e?(delete r[e],a=n(a,["_"].concat(i("0","9")).concat(i("a","z")).concat(i("A","Z")))):"\\."==e?(delete r[e],a[p["."]]=1):"\\"!=e.charAt(0)&&s?(a[e.toLowerCase()]=1,a[e.toUpperCase()]=1):"\\"==e.charAt(0)&&delete r[e];h[t]=n(r,a)}return h},setRegex:function(t,e){if(t){this.flags={},e=e||"/";for(var r=t.toString(),a=r.length,p=r.charAt(a-1);e!=p;)this.flags[p]=1,r=r.substr(0,a-1),a=r.length,p=r.charAt(a-1);e==r.charAt(0)&&e==r.charAt(a-1)&&(r=r.substr(1,a-2)),this.regex=r}return this},analyze:function(){var h,n,i,g="",o=[],l=[],u=!1;for(this.pos=0,this.groupIndex=0;this.pos<this.regex.length;)h=this.regex.charAt(this.pos++),u=t==h?!0:!1,u&&(h=this.regex.charAt(this.pos++)),u?"u"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),i=r.exec(this.regex.substr(this.pos-1)),this.pos+=i[0].length-1,l.push({part:i[0],flags:{Char:String.fromCharCode(parseInt(i[1],16)),Code:i[1]},type:"UnicodeChar"})):"x"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),i=a.exec(this.regex.substr(this.pos-1)),this.pos+=i[0].length-1,l.push({part:i[0],flags:{Char:String.fromCharCode(parseInt(i[1],16)),Code:i[1]},type:"HexChar"})):s[h]&&"/"!=h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),n={},n[s[h]]=1,l.push({part:h,flags:n,type:"Special"})):g+=h:"|"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),o.push({part:l,flags:{},type:"Sequence"}),l=[]):"["==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),l.push(this.chargroup())):"("==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),l.push(this.subgroup())):"{"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),i=e.exec(this.regex.substr(this.pos-1)),this.pos+=i[0].length-1,l.push({part:l.pop(),flags:{part:i[0],MatchMinimum:i[1],MatchMaximum:i[2]||"unlimited"},type:"Quantifier"})):"*"==h||"+"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),n={},n[p[h]]=1,"?"==this.regex.charAt(this.pos)?(n.isGreedy=0,this.pos++):n.isGreedy=1,l.push({part:l.pop(),flags:n,type:"Quantifier"})):"?"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),n={},n[p[h]]=1,l.push({part:l.pop(),flags:n,type:"Quantifier"})):p[h]?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),n={},n[p[h]]=1,l.push({part:h,flags:n,type:"Special"})):g+=h;return g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),o.length?(o.push({part:l,flags:{},type:"Sequence"}),l=[],n={},n[p["|"]]=1,this.parts={part:o,flags:n,type:"Alternation"}):this.parts={part:l,flags:{},type:"Sequence"},this},subgroup:function(){var h,n,i,g="",o=[],l=[],u={},f=!1,c=this.regex.substr(this.pos,2);for("?:"==c?(u.NotCaptured=1,this.pos+=2):"?="==c?(u.LookAhead=1,this.pos+=2):"?!"==c&&(u.NegativeLookAhead=1,this.pos+=2),u.GroupIndex=++this.groupIndex;this.pos<this.regex.length;)if(h=this.regex.charAt(this.pos++),f=t==h?!0:!1,f&&(h=this.regex.charAt(this.pos++)),f)"u"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),i=r.exec(this.regex.substr(this.pos-1)),this.pos+=i[0].length-1,l.push({part:i[0],flags:{Char:String.fromCharCode(parseInt(i[1],16)),Code:i[1]},type:"UnicodeChar"})):"x"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),i=a.exec(this.regex.substr(this.pos-1)),this.pos+=i[0].length-1,l.push({part:i[0],flags:{Char:String.fromCharCode(parseInt(i[1],16)),Code:i[1]},type:"HexChar"})):s[h]&&"/"!=h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),n={},n[s[h]]=1,l.push({part:h,flags:n,type:"Special"})):g+=h;else{if(")"==h)return g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),o.length?(o.push({part:l,flags:{},type:"Sequence"}),l=[],n={},n[p["|"]]=1,{part:{part:o,flags:n,type:"Alternation"},flags:u,type:"Group"}):{part:{part:l,flags:{},type:"Sequence"},flags:u,type:"Group"};"|"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),o.push({part:l,flags:{},type:"Sequence"}),l=[]):"["==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),l.push(this.chargroup())):"("==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),l.push(this.subgroup())):"{"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),i=e.exec(this.regex.substr(this.pos-1)),this.pos+=i[0].length-1,l.push({part:l.pop(),flags:{part:i[0],MatchMinimum:i[1],MatchMaximum:i[2]||"unlimited"},type:"Quantifier"})):"*"==h||"+"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),n={},n[p[h]]=1,"?"==this.regex.charAt(this.pos)?(n.isGreedy=0,this.pos++):n.isGreedy=1,l.push({part:l.pop(),flags:n,type:"Quantifier"})):"?"==h?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),n={},n[p[h]]=1,l.push({part:l.pop(),flags:n,type:"Quantifier"})):p[h]?(g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),n={},n[p[h]]=1,l.push({part:h,flags:n,type:"Special"})):g+=h}return g.length&&(l.push({part:g,flags:{},type:"String"}),g=""),o.length?(o.push({part:l,flags:{},type:"Sequence"}),l=[],n={},n[p["|"]]=1,{part:{part:o,flags:n,type:"Alternation"},flags:u,type:"Group"}):{part:{part:l,flags:{},type:"Sequence"},flags:u,type:"Group"}},chargroup:function(){var e,p,h,n,i,g,o=[],l=[],u={},f=!1,c=!1;for("^"==this.regex.charAt(this.pos)&&(u.NotMatch=1,this.pos++);this.pos<this.regex.length;)if(g=!1,h=p,p=this.regex.charAt(this.pos++),c=t==p?!0:!1,c&&(p=this.regex.charAt(this.pos++)),c&&("u"==p?(i=r.exec(this.regex.substr(this.pos-1)),this.pos+=i[0].length-1,p=String.fromCharCode(parseInt(i[1],16)),g=!0):"x"==p&&(i=a.exec(this.regex.substr(this.pos-1)),this.pos+=i[0].length-1,p=String.fromCharCode(parseInt(i[1],16)),g=!0)),f)l.length&&(o.push({part:l,flags:{},type:"Chars"}),l=[]),n[1]=p,f=!1,o.push({part:n,flags:{},type:"CharRange"});else if(c)!g&&s[p]&&"/"!=p?(l.length&&(o.push({part:l,flags:{},type:"Chars"}),l=[]),e={},e[s[p]]=1,o.push({part:p,flags:e,type:"Special"})):l.push(p);else{if("]"==p)return l.length&&(o.push({part:l,flags:{},type:"Chars"}),l=[]),{part:o,flags:u,type:"CharGroup"};"-"==p?(n=[h,""],l.pop(),f=!0):l.push(p)}return l.length&&(o.push({part:l,flags:{},type:"Chars"}),l=[]),{part:o,flags:u,type:"CharGroup"}}},o});/**
*
*   AceGrammar
*   @version: 0.4.2
*   Transform a grammar specification in JSON format,
*   into an ACE syntax-highlight parser mode
*
*   https://github.com/foo123/ace-grammar
*
**/!function(t,e,n,s){n=n?[].concat(n):[];var i,r=n.length,o=new Array(r),u=new Array(r),h=new Array(r);for(i=0;r>i;i++)o[i]=n[i][0],u[i]=n[i][1];if("object"==typeof module&&module.exports){if("undefined"==typeof module.exports[e]){for(i=0;r>i;i++)h[i]=module.exports[o[i]]||require(u[i])[o[i]];module.exports[e]=s.apply(t,h)}}else if("function"==typeof define&&define.amd)define(["exports"].concat(u),function(n){if("undefined"==typeof n[e]){for(var i=Array.prototype.slice.call(arguments,1),r=0,u=i.length;u>r;r++)h[r]=n[o[r]];n[e]=s.apply(t,h)}});else if("undefined"==typeof t[e]){for(i=0;r>i;i++)h[i]=t[o[i]];t[e]=s.apply(t,h)}}(this,"AceGrammar",[["Classy","./classy"],["RegExAnalyzer","./regexanalyzer"]],function(t,e,n){var s,r=t.Class,o="0.4.2",u=2,h=4,c=8,a=9,f=16,p=32,g=64,k=128,m=256,R=512,d=33,y=34,v=36,O=40,E=64,b=128,x=4,w=8,P=16,B=32,C=64,A=65,L=128,S=256,q=512,T=1024,_=2048,$=4096,M=8192,I={ONEOF:L,EITHER:L,ALL:S,ALLOF:S,ZEROORONE:q,ZEROORMORE:T,ONEORMORE:_},N={BLOCK:C,COMMENT:A,"ESCAPED-BLOCK":B,SIMPLE:P,GROUP:$,NGRAM:M,"N-GRAM":M},D=Array.prototype.slice,G=(Array.prototype.splice,Array.prototype.concat,Object.prototype.hasOwnProperty),K=Object.prototype.toString,j=function(t){var e=typeof t,s=K.call(t);return"number"==e||t instanceof Number?u:!0===t||!1===t?h:t&&("string"==e||t instanceof String)?1==t.length?a:c:t&&("[object RegExp]"==s||t instanceof RegExp)?f:t&&("[object Array]"==s||t instanceof Array)?p:t&&"[object Object]"==s?g:null===t?k:n===t?m:R},F=function(t,e){return e||p!=j(t)?[t]:t},z=function(t,e){return t=F(t,e),(e||p!=j(t[0]))&&(t=[t]),t},U=function(t){var e,n=j(t);if(g!=n&&p!=n)return t;var s,i={};for(s in t)G.call(t,s)&&(e=j(t[s]),i[s]=g==e?U(t[s]):p==e?t[s].slice():t[s]);return i},H=function(){var t=D.call(arguments),e=t.length;if(1>e)return null;if(2>e)return U(t[0]);var n,s,i,r,o=t.shift(),u=U(o);for(e--,s=0;e>s;s++)if(n=t.shift())for(i in n)G.call(n,i)&&(G.call(o,i)?(r=j(o[i]),g&~c&r&&(u[i]=H(o[i],n[i]))):u[i]=U(n[i]));return u},Z=/([\-\.\*\+\?\^\$\{\}\(\)\|\[\]\/\\])/g,V=function(t,e){return e.length-t.length},W=function(t,e){return c&j(e)&&c&j(t)&&e.length&&e.length<=t.length&&e==t.substr(0,e.length)},J=function(t,n,s){if(!t||u==j(t))return t;var i=n?n.length||0:0;if(i&&n==t.substr(0,i)){var r,o,h,l="^("+t.substr(i)+")";return s[l]||(r=new RegExp(l),h=new e(r).analyze(),o=h.getPeekChars(),Object.keys(o.peek).length||(o.peek=null),Object.keys(o.negativepeek).length||(o.negativepeek=null),s[l]=[r,o]),s[l]}return t},Q=function(t,e){var n,s,i={},r="";for(c==j(e)&&(r=e),n=0,s=t.length;s>n;n++)i[t[n].charAt(0)]=1,t[n]=t[n].replace(Z,"\\$1");return[new RegExp("^("+t.sort(V).join("|")+")"+r),{peek:i,negativepeek:null},1]},X=r({constructor:function(t){this.string=t?""+t:"",this.start=this.pos=0,this.stream=null},stream:null,string:"",start:0,pos:0,fromStream:function(t){return this.stream=t,this.string=""+t.string,this.start=t.start,this.pos=t.pos,this},toString:function(){return this.string},sol:function(){return 0==this.pos},eol:function(){return this.pos>=this.string.length},chr:function(t,e){e=!1!==e;var n=this.string.charAt(this.pos)||"";return t==n?(e&&(this.pos+=1,this.stream&&(this.stream.pos=this.pos)),n):!1},str:function(t,e,n){n=!1!==n;var s=this.pos,i=this.string.charAt(s);if(e.peek[i]){var r=t.length,o=this.string.substr(s,r);if(t==o)return n&&(this.pos+=r,this.stream&&(this.stream.pos=this.pos)),o}return!1},rex:function(t,e,n,s){n=!1!==n,s=s||0;var i=this.pos,r=this.string.charAt(i);if(e.peek&&e.peek[r]||e.negativepeek&&!e.negativepeek[r]){var o=this.string.slice(i).match(t);return!o||o.index>0?!1:(n&&(this.pos+=o[s].length,this.stream&&(this.stream.pos=this.pos)),o)}return!1},mch:function(t,e,n,s){if("string"!=typeof t){s=s||0;var i=this.string.slice(this.pos).match(t);return i&&i.index>0?null:(i&&e!==!1&&(this.pos+=i[s].length),i)}var r=function(t){return n?t.toLowerCase():t},o=this.string.substr(this.pos,t.length);return r(o)==r(t)?(e!==!1&&(this.pos+=t.length),!0):void 0},end:function(){return this.pos=this.string.length,this.stream&&(this.stream.pos=this.pos),this},pk:function(){return this.string.charAt(this.pos)},nxt:function(){if(this.pos<this.string.length){var t=this.string.charAt(this.pos++);return this.stream&&(this.stream.pos=this.pos),t}},bck:function(t){return this.pos-=t,this.stream&&(this.stream.pos=this.pos),this},bck2:function(t){return this.pos=t,this.stream&&(this.stream.pos=this.pos),this},spc:function(){for(var t=this.pos,e=this.pos;/[\s\u00a0]/.test(this.string.charAt(e));)++e;return this.pos=e,this.stream&&(this.stream.pos=this.pos),this.pos>t},cur:function(){return this.string.slice(this.start,this.pos)},sft:function(){return this.start=this.pos,this}}),Y=r({constructor:function(t){this.id=t||0,this.stack=[],this.t=w,this.inBlock=null,this.endBlock=null},id:0,stack:null,t:null,inBlock:null,endBlock:null,clone:function(){var t=new this.$class;return t.id=this.id,t.stack=this.stack.slice(),t.inBlock=this.inBlock,t.endBlock=this.endBlock,t.t=this.t,t},toString:function(){return"_"+this.id+"_"+this.t+"_"+this.inBlock}}),te=r({constructor:function(t,e,n){this.type=d,this.name=t,this.t=e,this.k=n||0,this.p=null},type:null,name:null,t:null,k:0,p:null,toString:function(){var t="[";return t+="Matcher: "+this.name,t+=", Type: "+this.type,t+=", Pattern: "+(this.t?this.t.toString():null),t+="]"},get:function(t,e){var n;return(n=t.chr(this.t,e))?[this.k,n]:!1}}),ee=r(te,{constructor:function(t,e,n){this.$super("constructor",t,e,n),this.type=y,this.p={peek:{},negativepeek:null},this.p.peek[""+e.charAt(0)]=1},get:function(t,e){var n;return(n=t.str(this.t,this.p,e))?[this.k,n]:!1}}),ne=r(te,{constructor:function(t,e,n){this.$super("constructor",t,e,n),this.type=v,this.t=e[0],this.p=e[1],this.g=e[2]||0},g:0,get:function(t,e){var n;return(n=t.rex(this.t,this.p,e,this.g))?[this.k,n]:!1}}),se=r(te,{constructor:function(t,e,n){this.$super("constructor",t,e,n),this.type=O,this.t=null},get:function(t,e){return!1!==e&&t.end(),[this.k,""]}}),ie=r(te,{constructor:function(t,e,n){this.type=E,this.name=t,this.ms=e,this.ownKey=!1!==n},ms:null,ownKey:!0,get:function(t,e){var n,s,i=this.ms,r=i.length;for(n=0;r>n;n++)if(s=i[n].get(t,e))return this.ownKey?[n,s[1]]:s;return!1}}),re=r(te,{constructor:function(t,e,n){this.type=b,this.name=t,this.s=new ie(this.name+"_StartMatcher",e,!1),this.t=this.s.t||null,this.e=n},s:null,e:null,get:function(t,e){var n=this.s.get(t,e);if(n){var s=this.e[n[0]];return u==j(s)&&(s=new ee(this.name+"_EndMatcher",n[1][s+1])),s}return!1}}),oe=function(t,e,n,s){n=n||0;var i,r=t+"_SimpleMatcher",o=j(e);return u==o?e:(s[r]||(i=k==o?new se(r,e,n):a==o?new te(r,e,n):c==o?new ee(r,e,n):p==o?new ne(r,e,n):e,s[r]=i),s[r])},ue=function(t,e,n,s,i,r){var o,u,h,l,c,a=!1,f=!1,g=t+"_CompoMatcher";if(!r[g]){if(o=F(e),h=o.length,s)for(l=(h>>1)+1,u=0;l>=u;u++){if(p==j(o[u])||p==j(o[h-1-u])){a=!0;break}if(W(o[u],n)||W(o[h-1-u],n)){f=!0;break}}if(!s||a||f){for(u=0;h>u;u++)o[u]=p==j(o[u])?ue(g+"_"+u,o[u],n,s,i,r):oe(g+"_"+u,J(o[u],n,i),u,r);c=o.length>1?new ie(g,o):o[0]}else c=oe(g,Q(o,s),0,r);r[g]=c}return r[g]},he=function(t,e,n,s,i){var r,o,u,h,l,c,a,f=t+"_BlockMatcher";if(!i[f]){for(h=[],l=[],r=z(e),o=0,u=r.length;u>o;o++)c=oe(f+"_0_"+o,J(r[o][0],n,s),o,i),a=r[o].length>1?oe(f+"_1_"+o,J(r[o][1],n,s),o,i):c,h.push(c),l.push(a);i[f]=new re(f,h,l)}return i[f]},le=r({constructor:function(t,e,n,s){this.type=n||null,this.name=t||null,this.t=e||null,this.v=s||null},name:null,type:null,t:null,v:null,isRequired:!1,ERROR:!1,streamPos:null,stackPos:null,actionBefore:null,actionAfter:null,toString:function(){var t="[";return t+="Tokenizer: "+this.name,t+=", Type: "+this.type,t+=", Token: "+(this.t?this.t.toString():null),t+="]"},required:function(t){return this.isRequired=t?!0:!1,this},push:function(t,e,n){return this.stackPos?t.splice(this.stackPos+(n||0),0,e):t.push(e),this},clone:function(){var t,e,n=D.call(arguments),s=n.length;for(t=new this.$class,t.type=this.type,t.name=this.name,t.t=this.t,t.v=this.v,t.isRequired=this.isRequired,t.ERROR=this.ERROR,t.streamPos=this.streamPos,t.stackPos=this.stackPos,t.actionBefore=this.actionBefore,t.actionAfter=this.actionAfter,e=0;s>e;e++)t[n[e]]=this[n[e]];return t},get:function(t,e){return this.t.get(t)?(e.t=this.type,this.v):!1}}),ce=r(le,{constructor:function(t,e,n,s,i){this.$super("constructor",t,e,n,s),this.multiline=!1!==i,this.e=null},multiline:!1,e:null,get:function(t,e){var n=!1,s=!1;if(e.inBlock==this.name?(s=!0,this.e=e.endBlock):!e.inBlock&&(this.e=this.t.get(t))&&(s=!0,e.inBlock=this.name,e.endBlock=this.e),s){for(this.stackPos=e.stack.length,n=this.e.get(t);!n&&!t.eol();){if(this.e.get(t)){n=!0;break}t.nxt()}return n=n||!this.multiline&&t.eol(),n?(e.inBlock=null,e.endBlock=null):this.push(e.stack,this),e.t=this.type,this.v}return e.inBlock=null,e.endBlock=null,!1}}),ae=r(ce,{constructor:function(t,e,n,s,i,r){this.$super("constructor",t,e,n,s),this.esc=i||"\\",this.multiline=r||!1,this.e=null},esc:"\\",get:function(t,e){var n="",s=!1,i=!1,r=!1;if(e.inBlock==this.name?(i=!0,this.e=e.endBlock):!e.inBlock&&(this.e=this.t.get(t))&&(i=!0,e.inBlock=this.name,e.endBlock=this.e),i){for(this.stackPos=e.stack.length,s=this.e.get(t);!s&&!t.eol();){if(!r&&this.e.get(t)){s=!0;break}n=t.nxt(),r=!r&&n==this.esc}return s=s||!(r&&this.multiline),s?(e.inBlock=null,e.endBlock=null):this.push(e.stack,this),e.t=this.type,this.v}return e.inBlock=null,e.endBlock=null,!1}}),fe=r(le,{constructor:function(t,e){this.$super("constructor",t,e),this.ts=null},ts:null,makeToks:function(t){return t&&(this.ts=F(t),this.t=this.ts[0]),this}}),pe=r(fe,{constructor:function(t,e){this.type=q,this.name=t||null,e&&this.makeToks(e)},get:function(t,e){this.isRequired=!1,this.ERROR=!1,this.streamPos=t.pos;var n=this.t,s=n.get(t,e);return n.ERROR&&t.bck2(this.streamPos),s}}),ge=r(fe,{constructor:function(t,e){this.type=T,this.name=t||null,e&&this.makeToks(e)},get:function(t,e,n){var s,i,r,o=this.ts,u=o.length,h=0;for(this.isRequired=!1,this.ERROR=!1,this.streamPos=t.pos,this.stackPos=e.stack.length,s=0;u>s;s++){if(i=o[s],r=i.get(t,e,n),!1!==r)return this.push(e.stack,this),r;i.ERROR&&(h++,t.bck2(this.streamPos))}return!1}}),ke=r(fe,{constructor:function(t,e){this.type=_,this.name=t||null,e&&this.makeToks(e),this.foundOne=!1},foundOne:!1,get:function(t,e,n){var s,i,r,o=this.ts,u=o.length,h=0,l=0;for(this.isRequired=!this.foundOne,this.ERROR=!1,this.streamPos=t.pos,this.stackPos=e.stack.length,r=0;u>r;r++){if(i=o[r],s=i.get(t,e,n),h+=i.isRequired?1:0,!1!==s)return this.foundOne=!0,this.isRequired=!1,this.ERROR=!1,this.push(e.stack,this.clone("ts","foundOne")),this.foundOne=!1,s;i.ERROR&&(l++,t.bck2(this.streamPos))}return this.ERROR=this.foundOne?!1:!0,!1}}),me=r(fe,{constructor:function(t,e){this.type=L,this.name=t||null,e&&this.makeToks(e)},get:function(t,e,n){var s,i,r,o=this.ts,u=o.length,h=0,l=0;for(this.isRequired=!0,this.ERROR=!1,this.streamPos=t.pos,r=0;u>r;r++){if(i=o[r],s=i.get(t,e,n),h+=i.isRequired?1:0,!1!==s)return s;i.ERROR&&(l++,t.bck2(this.streamPos))}return this.isRequired=h>0?!0:!1,this.ERROR=u==l&&h>0?!0:!1,!1}}),Re=r(fe,{constructor:function(t,e){this.type=S,this.name=t||null,e&&this.makeToks(e)},get:function(t,e,n){var s,i,r=this.ts,o=r.length,u=!1;if(this.isRequired=!0,this.ERROR=!1,this.streamPos=t.pos,this.stackPos=e.stack.length,s=r[0],i=s.required(!0).get(t,e,n),!1!==i){this.stackPos=e.stack.length;for(var h=o-1;h>0;h--)this.push(e.stack,r[h].required(!0),o-h);u=i}else s.ERROR?(this.ERROR=!0,t.bck2(this.streamPos)):s.isRequired&&(this.ERROR=!0);return u}}),de=r(fe,{constructor:function(t,e){this.type=M,this.name=t||null,e&&this.makeToks(e)},get:function(t,e,n){var s,i,r=this.ts,o=r.length,u=!1;if(this.isRequired=!1,this.ERROR=!1,this.streamPos=t.pos,this.stackPos=e.stack.length,s=r[0],i=s.required(!1).get(t,e,n),!1!==i){this.stackPos=e.stack.length;for(var h=o-1;h>0;h--)this.push(e.stack,r[h].required(!0),o-h);u=i}else s.ERROR&&t.bck2(this.streamPos);return u}}),ye=function(t,e){var n,s,r,o=z(t.tokens.slice());for(i=0,l=o.length;l>i;i++)n=o[i][0],s=o[i].length>1?o[i][1]:o[i][0],r=o[i].length>2?o[i][2]:"",null===s?(e.line=e.line||[],e.line.push(n)):(e.block=e.block||[],e.block.push([n,s,r]))},ve=function(t,e,n,i,r,o,u,h,l,c){var a,f,p,g,k,m=null;if(!l[t]){if(a=i[t]||r[t]||null)if(f=a.type||"simple",f=N[f.toUpperCase()],k=a.action||null,C==f||A==f)A==f&&ye(a,c),m=new ce(t,he(t,a.tokens.slice(),e,u,h),f,o[t]||s,a.multiline);else if(B==f)m=new ae(t,he(t,a.tokens.slice(),e,u,h),f,o[t]||s,a.escape||"\\",a.multiline||!1);else if(P==f)m=new le(t,ue(t,a.tokens.slice(),e,n[t],u,h),f,o[t]||s);else if($==f){p=I[a.match.toUpperCase()],g=F(a.tokens).slice();for(var R=0,d=g.length;d>R;R++)g[R]=ve(g[R],e,n,i,r,o,u,h,l,c);m=q==p?new pe(t,g):T==p?new ge(t,g):_==p?new ke(t,g):L==p?new me(t,g):new Re(t,g)}else if(M==f){m=z(F(a.tokens).slice()).slice();for(var R=0,d=m.length;d>R;R++){for(var y=m[R],v=0,O=y.length;O>v;v++)y[v]=ve(y[v],e,n,i,r,o,u,h,l,c);m[R]=new de(t+"_NGRAM_"+R,y)}}l[t]=m}return l[t]},Oe=r({constructor:function(t,e){this.LOC=e,this.Grammar=t,this.Comments=t.Comments||{},this.Tokens=t.Parser||[],this.DEF=this.LOC.DEFAULT,this.ERR=t.Style&&t.Style.error?t.Style.error:this.LOC.ERROR},LOC:null,ERR:null,DEF:null,Grammar:null,Comments:null,Tokens:null,getLineTokens:function(t,e,n){var s,i,r,o,u,h,l,c,a=this.Tokens,f=a.length,p=this.LOC,g=this.DEF,k=this.ERR;for(o=[],l=new X(t),e=e||new Y,e=e.clone(),e.id=1+n,c=e.stack,u={type:null,value:""},h=null;!l.eol();)if(i=!1,h&&h!==u.type?(u.type&&o.push(u),u={type:h,value:l.cur()},l.sft()):u.type&&(u.value+=l.cur(),l.sft()),l.spc())e.t=w,h=g;else{for(;c.length&&!l.eol();){if(r=c.pop(),h=r.get(l,e,p),!1!==h){i=!0;break}if(r.ERROR||r.isRequired){c.length=0,l.nxt(),e.t=x,h=k,i=!0;break}}if(!i){if(l.eol())break;for(s=0;f>s;s++){if(r=a[s],h=r.get(l,e,p),!1!==h){i=!0;break}if(r.ERROR||r.isRequired){c.length=0,l.nxt(),e.t=x,h=k,i=!0;break}}if(!i){if(l.eol())break;l.nxt(),e.t=w,h=g}}}return h&&h!==u.type?(u.type&&o.push(u),o.push({type:h,value:l.cur()})):u.type&&(u.value+=l.cur(),o.push(u)),u={type:null,value:""},{state:e,tokens:o}},$getIndent:function(t){return t.match(/^\s*/)[0]},getNextLineIndent:function(t,e){return e.match(/^\s*/)[0]},getKeywords:function(){return[]},$createKeywordList:function(){return[]},getCompletions:function(){return[]}}),Ee=function(t,e){return new Oe(t,e)},be=function(t){return{getTokenizer:function(){return t},lineCommentStart:t.Comments.line?t.Comments.line[0]:null,blockComment:t.Comments.block?{start:t.Comments.block[0][0],end:t.Comments.block[0][1]}:null,toggleCommentLines:function(){return!1},toggleBlockComment:function(){},getNextLineIndent:function(e,n,s){return t.getNextLineIndent(e,n,s)},checkOutdent:function(){return!1},autoOutdent:function(){},$getIndent:function(e){return t.$getIndent(e)},getKeywords:function(e){return t.getKeywords(e)},$createKeywordList:function(){return t.$createKeywordList()},getCompletions:function(e,n,s,i){return t.getCompletions(e,n,s,i)},HighlightRules:null,$behaviour:null,createWorker:function(){return null},createModeDelegates:function(){},$delegator:function(){},transformAction:function(){}}},xe={RegExpID:null,RegExpGroups:null,Style:{error:"invalid"},Lex:null,Syntax:null,Parser:null},we=function(t){var e,n,s,i,r,o,u,h,l,c,a,f={},g={},k={},m={};if(t.__parsed)return t;for(t=H(t,xe),e=t.RegExpID||null,t.RegExpID=null,delete t.RegExpID,n=t.RegExpGroups||{},t.RegExpGroups=null,delete t.RegExpGroups,u=t.Lex||{},t.Lex=null,delete t.Lex,h=t.Syntax||{},t.Syntax=null,delete t.Syntax,o=t.Style||{},r=t.Parser||[],i=r.length,s=[],l=0;i>l;l++)c=r[l],a=ve(c,e,n,u,h,o,f,g,k,m)||null,a&&(p==j(a)?s=s.concat(a):s.push(a));return t.Parser=s,t.Style=o,t.Comments=m,t.__parsed=!0,t},Pe={VERSION:o,extend:H,parse:we,getMode:function(t,e){s="text",t=we(t);var n={DEFAULT:e||s,ERROR:xe.Style.error};return be(Ee(t,n))}};return Pe});