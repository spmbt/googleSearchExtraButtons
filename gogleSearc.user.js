// ==UserScript==
// @name        Google Search Extra Buttons
// @name:ru     GoogleSearchExtraButtons
// @description Add buttons (last day, last week, PDF search etc.) to results of search page of Google
// @description:ru Добавляет 5 кнопок вариантов поиска рядом с кнопкой поиска Google на странице результатов
// @version     3.2015.2.18
// @namespace   spmbt.github.com
// @include     http://www.google.*/*
// @include     https://www.google.*/*
// ==/UserScript==  

(function(lang, yourSite){

if(!(yourSite instanceof Array)) yourSite = [yourSite];
var $x = function(el, h){if(h) for(var i in h) el[i] = h[i]; return el;} //===extend===
	,$pd = function(ev){ev.preventDefault();}
	,d = document
,$e = function(g){ //===создать или использовать имеющийся элемент===
	//g={el|clone,IF+ifA,q|[q,el],cl,ht,cs,at,atRemove,on,apT}
	if(typeof g.IF =='function')
		g.IF = g.IF.apply(g, g.ifA ||[]);
	g.el = g.IF && g.IF.attributes && g.IF || g.el || g.clone ||'DIV';
	var o = g.o = g.clone && g.clone.cloneNode && g.clone.cloneNode(!0)
			|| (typeof g.el =='string' ? d.createElement(g.el) : g.el);
	if(o && (g.IF===undefined || g.IF || !g.IF && typeof g.IF =='object')
			&& (!g.q || g.q && (g.dQ = g.q instanceof Array ? dQ(g.q[0], g.q[1]) : dQ(g.q)) ) ){ //выполнять, если существует; g.dQ - результат селектора для функций IF,f
		if(g.cl)
			o.className = g.cl;
		if(g.cs)
			$x(o.style, g.cs);
		if(g.ht || g.at){
			var at = g.at ||{}; if(g.ht) at.innerHTML = g.ht;}
		if(at)
			for(var i in at){
				if(i=='innerHTML') o[i] = at[i];
				else o.setAttribute(i, at[i]);}
		if(g.atRemove)
			for(var i in g.atRemove)
				o.removeAttribute(g.atRemove[i]);
		if(g.on)
			for(var i in g.on) if(g.on[i])
				o.addEventListener(i, g.on[i],!1);
		g.ap && o.appendChild(g.ap);
		g.apT && g.apT.appendChild(o);
	}
	return o;
},
addRules = function(css){
	var heads = d.getElementsByTagName('head')
		,node = d.createElement('style');
	heads.length && heads[0].appendChild(node);
	node.appendChild(d.createTextNode(css));
};
/**
 * check occurrence of third-party event with growing interval
 * @constructor
 * @param{Number} t start period of check
 * @param{Number} i number of checks
 * @param{Number} m multiplier of period increment
 * @param{Function} check event condition
 * @param{Function} occur event handler
 */
var Tout = function(h){
		var th = this;
		(function(){
					if((h.dat = h.check() )) //wait of positive result, then occurense
				h.occur();
			else if(h.i-- >0) //next slower step
				th.ww = setTimeout(arguments.callee, (h.t *= h.m) );
		})();
	},
	lNull = lang ==null; //if lang == null|undefined, then no hints
lang = lang =='ru'|| !(lang && lang.length && lang.length >1); //hints in ru or en lang
addRules('.siteList:hover button{display: block}' //TODO no effect
	+'.siteList{height:auto; text-align:center}'
	+'.gb_Ib >.gb_e{height:47px}.gb_Fb{z-index:1087}.tsf-p{z-index:203}');

new Tout({t:120, i:8, m: 1.6
	,check: function(){
			return d && d.getElementsByName("q") && d.getElementsByName("q")[0];
	},
	occur: function(){
		var inputSearch = this.dat
				,buttSearch = d.getElementsByName("btnG") && d.getElementsByName("btnG")[0]
			,buttS ={
				PDF:['filetype:pdf',lang?'поиск по документам PDF':lNull?'':'search in PDF files']
				,site:['site:'+ yourSite[0],(lang ?'искать по ':lNull?'':'search in ')+ yourSite[0]] //write your site name and uncomment
				,'1D':['&tbs=qdr:d',lang?'за последние сутки':lNull?'':'last day']
				,'7D':['&tbs=qdr:w',lang?'за последнюю неделю':lNull?'':'last week']
				,'1M':['&tbs=qdr:m',lang?'за последний месяц':lNull?'':'last month']
				,'1Y':['&tbs=qdr:y',lang?'за последний год':lNull?'':'last year']
			}, j = 0, ww =0
			,buttCss = {opacity: 0.64, lineHeight:'14px', width:'55px', height:'16px', fontSize:'14px', border:'1px solid transparent', backgroundColor:'#4485f5', color:'#fff'};
		!yourSite && delete buttS.site;
		buttSearch.parentNode.style.position ='relative';
		if(buttSearch && top == self)
			for(var i in buttS)
				var bI = buttS[i]
					,butt2 = $e({clone: i=='site'? $e({cl:'siteList',cs:{cursor:'default'} }) : buttSearch
						,atRemove:['id','name']
						,at:{value: i
							,innerHTML: i
							,title: bI[1]}
						,cs: $x({position:'absolute', top:'33px', left: (-82 + 60*j++) +'px'}, buttCss)
						,on:{click: (function(bI,i){return i =='PDF'|| /^site:/.test(bI[0]) ? function(ev){
							inputSearch.value = inputSearch.value.replace(/site\:[\w.]+$/i,'') +' '+ (ev.target.className=='siteList'? bI[0] : 'site:'+ ev.target.getAttribute('site'));
							if(ev.target.className=='siteList') this.form.click();
						}:function(ev){
							location.href ='/search?q='+ encodeURIComponent(inputSearch.value) + bI[0];
							$pd(ev);
						}})(bI,i),
							mouseover: i=='site'? function(ev){clearTimeout(ww); ev.target.querySelector('.list').style.display ='block'}:'',
							mouseout: i=='site'? function(ev){var t = ev.target; clearTimeout(ww); ww = setTimeout(function(){t.parentNode.parentNode.querySelector('.list').style.display ='none'},450);}:''
						}
						,apT: buttSearch.parentNode
					});
		var siteList = $e({cl:'list',cs:{display:'none'}, apT: buttSearch.parentNode.querySelector('.siteList')});
		if(siteList){
			for(var i in yourSite) if(i !=0)
				var sI = yourSite[i]
					,butt3 = $e({clone:buttSearch
						,atRemove:['id','name']
						,at:{value: sI
							,site: sI
							,title: (lang ?'искать по ':lNull?'':'search in ')+ sI
							,innerHTML: sI}
						,cs: $x($x({display:'block'}, buttCss),{width:'auto', height:'18px', margin:'2px 0 -1px -16px', padding:0, fontWeight:'normal', opacity:1})
						,apT: siteList
					});
			siteList.style.height ='auto'; siteList.style.textAlign ='center';}
		$e({el:d.querySelector('.gb_Ib > .gb_e'),cs:{height:'47px'}} );
		$e({el:d.querySelector('.gb_Fb'),cs:{zIndex:'1087'}} );
		$e({el:d.querySelector('.tsf-p'),cs:{zIndex:'203'}} );
	}
});

})('en' //write '' to remove hints; 'en' for English hints, 'ru' for Russian
	,['slashdot.org','engadget.com','techcrunch.com','habrahabr.ru','geektimes.ru','smashingmagazine.com','maketecheasier.com']); //write your favorite sites
