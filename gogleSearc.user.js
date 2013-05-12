// ==UserScript==
// @name		  GoogleSearchExtraButtons
// @version	   1.11
// @namespace	 barsmonster, spmbt
// @include	   http://www.google.*/*
// @include	   https://www.google.*/*
// ==/UserScript== 

(function(){

var $x = function(el, h){if(h) for(var i in h) el[i] = h[i]; return el;} //===extend===
	,$pd = function(ev){ev.preventDefault();}
,$e = function(g){ //===создать или использовать имеющийся элемент===
	//g={el|clone,IF+ifA,q|[q,el],cl,ht,cs,at,atRemove,on,apT}
	if(typeof g.IF =='function')
		g.IF = g.IF.apply(g, g.ifA ||[]);
	g.el = g.IF && g.IF.attributes && g.IF || g.el || g.clone ||'DIV';
	var o = g.o = g.clone && g.clone.cloneNode(!0)
			|| (typeof g.el =='string' ? document.createElement(g.el) : g.el);
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
		g.apT && g.apT.appendChild(o); //ставится по ориентации, если новый
	}
	return o;
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
		if((h.dat = h.check() )) //wait of positive result, then occcurense
			h.occur();
		else if(h.i-- >0) //next slower step
			th.ww = setTimeout(arguments.callee, (h.t *= h.m) );
	})();
};
new Tout({t:120, i:8, m: 1.6
	,check: function(){
		return document && document.getElementsByName("q") && document.getElementsByName("q")[0];
	}
	,occur: function(){
		var inputSearch = this.dat
			,buttSearch = document.getElementsByName("btnG") && document.getElementsByName("btnG")[0]
			,buttS =[
				['PDF','filetype:pdf']
				//,['S',site:yoursite.com'] //write your site name and uncomment
				,['1D','&tbs=qdr:d']
				,['7D','&tbs=qdr:w']
				,['1M','&tbs=qdr:m']
				,['1Y','&tbs=qdr:y']
			], j =0;
		buttSearch.parentNode.style.position ='relative';
		if(buttSearch)
			for(var i in buttS)
				var bI = buttS[i]
					,butt2 = $e({clone: buttSearch
						,atRemove:['id','name']
						,at:{value: bI[0]
							,innerHTML: bI[0]}
						,cs:{position:'absolute', top:'33px', left: (-82 + 60*j++) +'px', opacity: 0.74}
						,on:{click: (function(bI){return bI[0] =='PDF'|| /^site:/.test(bI[1]) ? function(ev){
							inputSearch.value +=' '+ bI[1];
						}:function(ev){
							location.href ='/search?q='+ encodeURIComponent(inputSearch.value) + bI[1];
							$pd(ev);
						}})(bI) }
						,apT: buttSearch.parentNode
					});
	}
});

})();
