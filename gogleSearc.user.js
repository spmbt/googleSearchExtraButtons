// ==UserScript==
// @name        Google Search Extra Buttons
// @name:ru     GoogleSearchExtraButtons
// @description Add buttons (last 1/2/3 days, weeks, PDF search etc.) for results of Google search page
// @description:ru Кнопки вариантов поиска для результатов Google (1-2-3 дня, недели, PDF, ...)
// @version     11.2015.11.30
// @namespace   spmbt.github.com
// @include     http://www.google.*/search*
// @include     https://www.google.*/search*
// @include     https://www.google.*/*
// @include     https://encrypted.google.*/search*
// @include     https://spmbt.github.io/googleSearchExtraButtons/saveYourLocalStorage.html
// ==/UserScript==
if(location.host=='spmbt.github.io'){
	window.addEventListener('message', function(ev){
		if(/^https?:\/\/www\.google\./.test(ev.origin)){
			var d = JSON.parse(ev.data), tok = d.tok, key = d.key;
			switch(d.do){
				case 'set':
					localStorage[key] = JSON.stringify(d.val);
					break;
				case 'get':
					var h = JSON.parse(localStorage[key]);
					break;
				case 'remove':
					localStorage.removeItem(key);
			}
			console.log('[io]', d, tok);
			ev.source.postMessage(JSON.stringify(h ? {tok: tok, h: h} : {tok: tok}), ev.origin);
		}},!1);
}else

(function(setts){ //lang, sites, lastHoursLess

var $x = function(el, h){if(h) for(var i in h) el[i] = h[i]; return el;} //===extend===
	,$pd = function(ev){ev.preventDefault();}
	,d = document
,$e = function(g){ //===create or use existing element=== //g={el|clone,cl,ht,cs,at,atRemove,on,apT}
	g.el = g.el || g.clone ||'DIV';
	var o = g.o = g.clone && g.clone.cloneNode && g.clone.cloneNode(!0)
			|| (typeof g.el =='string' ? d.createElement(g.el) : g.el);
	if(o){ //execute if exist
		if(g.cl)
			o.className = g.cl;
		if(g.clAdd)
			o.classList.add(g.clAdd);
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
 * @param{Number} h.t start period of check
 * @param{Number} h.i number of checks
 * @param{Number} h.m multiplier of period increment
 * @param{Function} h.check event condition
 * @param{Function} h.occur event handler
 */
var Tout = function(h){
		var th = this;
		(function(){
			if((h.dat = h.check() )) //wait of positive result, then occurs
				h.occur();
			else if(h.i-- >0) //next slower step
				th.ww = setTimeout(arguments.callee, (h.t *= h.m) );
		})();
	}
//for xLocStor:
	,xLocStorOrigin = d.location.protocol +'//spmbt.github.io'
	,qr, qrs ={} //set of queries "key-calls" (ок, toutLitt, toutLong, noService, noStorage)
	,qrI = 0 //queries counter
	,qrN = 12 //max number of waiting queries
	,errIMax = 120, errNMax = errIMax //max number of errors
	,ns ='googXButtons_' //namespace for keys
	,getLocStor = function(name){
		return (JSON.parse(localStorage && localStorage[ns + name] ||'{}')).h;}
	,removeLocStor = function(name){localStorage && localStorage.removeItem(ns + name);}
	,listenMsg
/**
 * external localStorage for using another domain if current domain storage is erased anywhere
 * @param{String} h.do - action: set|get|remove
 * @param{String} h.key
 * @param{Object|undefined} h.val (any type)
 * @param{Number|undefined} h.toutLitt
 * @param{Number|undefined} h.tout
 * @param{Function} h.cB - callback with one argument
 * @param{Function|undefined} h.err - callback for err with one argument
 */
	,xLocStor = function(h){
		var h0 = h;
		h.toutLitt = h.toutLitt || 400;
		h.tout = h.tout || 4000;
		var ifr = d.getElementById('xLocStor')
			,query = function(){
				if((qrI += 1) > qrN){
					xCatch('longQrs', null, h);
					return;}
				ifr.contentWindow.postMessage(JSON.stringify($x({
						do: h.do
						,tok: token
						,key: ns + h.key
					}, h.val !==undefined ? {val: h.val}:{}) )
				, xLocStorOrigin);
				qrs[token] = $x({ //for wait of response
					wToutLitt: (function(h, qrI, errIMax){return setTimeout(function(){
							qrI -= 1;
							if((errIMax -= 1) >=0)
								console.warn('toutLitt', h);
							chkErrMax();
						}, h.toutLitt);})(h, qrI, errIMax)
					,wTout: (function(h, qrI){return setTimeout(function(){
							qrI -= 1;
							//xCatch('tout', null, h);
							//xLocStor(h0);
						}, h.tout);})(h, qrI)
				}, h);
			}
			,token = +new Date() + (Math.random()+'').substr(1,8)
			,el = h.el;
		delete h.el;
		if(ifr) query();
		else ifr = $e({
			el: 'iframe',
			at:{id: 'xLocStor'
				,src: xLocStorOrigin +'/googleSearchExtraButtons/saveYourLocalStorage.html'},
			cs: {display: 'none'},
			on: {load: query},
			apT: el || d.body
		});
		if(!listenMsg) addEventListener('message', function(ev){
			if(ev.origin == xLocStorOrigin){    // {"tok":"<value>"[,"err":"<txt>"],"h":...}
				console.log('from_io', JSON.parse(ev.data))
				var resp = ev.data && ev.data[0] =='{' && JSON.parse(ev.data);
				if(!resp) xCatch('bad_format', resp, h);
				if(( qr = qrs[resp.tok] )){
					qrI -= 1;
					qr.cB(resp.h);
					var er = qr.err;
					delete qrs[resp.tok];} // else ignore unsufficient token
				if(resp.err && (!er || er(resp.err)) ) //individual or common error processing depends of er()
					xCatch(resp.err, resp, h);
		}},!1);
		listenMsg =1;
	},
		//for tests: localStorage.googXButtons_dwmyh = JSON.stringify({h:[1,2,1,1,1]})
		//$('#xLocStor').contentWindow.postMessage('{"do":"get","key":"googXButtons_dwmyh"}','https://spmbt.github.io')
	xCatch = function(er, resp, h){
		if((errIMax -= 1) >=0)
			console.error('tok:', resp && resp.tok ||'--','; err:', er,';  h:', h,'; respH:', resp && resp.h);
		chkErrMax();
	},
	chkErrMax = function(){if(!errIMax) console.error('Too many err messages:', errNMax)}
	,$l ={ru:{
		'search in PDF files':'поиск по документам PDF'
		,'search in':'искать по'
		,'from / to':'за период'
		,'last':['за последний','за последние','за последнюю']
		,'day':'сутки'
		,'days':['дня','дней']
		,'week':'неделю'
		,'weeks':['недели','недель']
		,'month':'месяц'
		,'months':['месяца','месяцев']
		,'year':'год'
		,'years':['года','лет']
		,'hour':'час'
		,'hours':['часа','часов']
		,'Settings':'Настройки'
		,'of userscript':'юзерскрипта'
		,'reload page for effect':'перезагрузить страницу'
		,'Interface language':'Язык интерфейса'
		,'Sites':'Сайты'
	},fr:{
		'search in PDF files':'la recherche dans les fichiers PDF'
		,'search in':'rechercher dans'
		,'from / to':'pour la période'
		,'last':['le dernier','dans les derniers','dans les derniers']
		,'day':'jour'
		,'days':['jours','jours']
		,'week':'semaine'
		,'weeks':['semaines','semaines']
		,'month':'mois'
		,'months':['mois','mois']
		,'year':'an'
		,'years':['ans','ans']
		,'hour':'heure'
		,'hours':['heures','heures']
		,'Settings':'Paramètres'
		,'of userscript':'de Userscript'
		,'reload page for effect':'recharger la page pour effet'
		,'Interface language':'Langue de l\'interface'
		,'Sites':'Les sites'
	},de:{
		'search in PDF files':'suche in PDF-Dateien'
		,'search in':'suche in'
		,'from / to':'im Zeitraum'
		,'last':['letzte','letzte','letzte']
		,'day':'Tag'
		,'days':['Tage','Tagen']
		,'week':'Woche'
		,'weeks':['Wochen','Wochen']
		,'month':'Monat'
		,'months':['Monate','Monaten']
		,'year':'Jahr'
		,'years':['Jahre','Jahre']
		,'hour':'Stunde'
		,'hours':['Stunden','Stunden']
		,'Settings':'Einstellungen'
		,'of userscript':'von userscript'
		,'reload page for effect':'nachladen Seite für Effekt'
		,'Interface language':'Schnittstellensprache'
		,'Sites':'Webseiten'
	},es:{
		'search in PDF files':'búsqueda en archivos PDF'
		,'search in':'busca en'
		,'from / to':'para el período'
		,'last':['el último','en los últimos','en los últimos']
		,'day':'día'
		,'days':['días','días']
		,'week':'Semana'
		,'weeks':['semanas','semanas']
		,'month':'mes'
		,'months':['meses','meses']
		,'year':'año'
		,'years':['años','años']
		,'hour':'hora'
		,'hours':['horas','horas']
		,'Settings':'Ajustes'
		,'of userscript':'de userscript'
		,'reload page for effect':'página para efecto de recargar'
		,'Interface language':'Idioma de interfaz'
		,'Sites':'Sitios'
	}}; //if !lang, then no hints
addRules('.siteList:hover button{display: block}'
	+'.gb_Ib >.gb_e{height:47px}.gb_Fb{z-index:1087}.tsf-p{z-index:203}'
	+'.lsbb .xButt,.lsbb >.siteList{z-index: 2002; width:34px; height:17px; padding:0 2px; line-height:14px;'
		+'font-size:14px; border:1px solid transparent; background-color:#4889f1; color:#fff; opacity: 0.64}'
	+'.lsbb >.siteList{width:32px; height:auto; padding:1px 0 2px; text-align:center}'
	+'.lsbb >.siteList .lsb{font-weight: normal; color:#d4d4d4}.lsbb .lsb:hover{opacity: 1; color:#fff}'
	+'.siteList .sett .txt{padding: 0 2px}'
	+'.siteList .settIn{display: none; width: 250px; padding: 2px 4px; text-align:left; border:1px solid #48f;'
		+'background-color:#eef; color:#336}'
	+'.siteList .settIn hr{margin:2px 0}'
	+'.sbibtd .sfsbc, .sbibtd .sfsbc .nojsb, .siteList .sett:hover .settIn, .siteList .settIn.changed,'
		+'.siteList .settIn.changed .reload{display: block}.siteList .settIn .reload, .siteList.hiddn{display: none}');
var S ={}, settsLength =0; for(var i in setts) settsLength++;
for(var i in setts)
	{S[i] = setts[i]; settsLength--;}
	//xLocStor({op:'get', key: i, cB: (function(i){return function(dat){S[i] = dat; settsLength--;}})(i) }); //TODO promises

new Tout({t:120, i:8, m: 1.6
	,check: function(){
		return /*!settsLength &&*/ d && d.getElementsByName('q') && d.getElementsByName('q')[0];
	},
	occur: function(){
		//alert(11)
		var lang = S.lang != null && S.lang || setts.lang
			,sites = S.sites && S.sites.length && S.sites || setts.sites;
		sites = sites instanceof Array && sites || [sites] || setts.sites ||[];
		var strSites = sites.join('\n')
			,$LSettings
			,$L = $l[lang] || $l.ru; //default template of lang
		if(!lang || !$l[lang] || lang =='en') for(var l in $L){ //replace 'en' lang for default or substitution
			if($L[l] instanceof Array) for(var l2 in $L[l])
				$L[l][l2] = l;
			else
				$L[l] = l;
		}
		if(sites.length)
			sites.push($LSettings = $L['Settings'])
			,mainPg = /\/search\?/.test(location.href);
		var inputSearch = this.dat
				,buttSearch = d.getElementsByName("btnG") && d.getElementsByName('btnG')[0]
			,buttS ={
				PDF:{url:'filetype:pdf', txt:$L['search in PDF files']}
				,site:{url:'site:'+ sites[0], txt:$L['search in']+' '+ sites[0], one:'day'} //you may comment this line
				,'.. : ..':{url:'', txt:$L['from / to']}
				,'1D':{url:'&tbs=qdr:d', txt:$L['last'][1] +' '+ $L['day'], one:'day', up:13}
				,'7D':{url:'&tbs=qdr:w', txt:$L['last'][2] +' '+ $L['week'], one:'week', up:10}
				,'1M':{url:'&tbs=qdr:m', txt:$L['last'][0] +' '+ $L['month'], one:'month', up:11}
				,'1Y':{url:'&tbs=qdr:y', txt:$L['last'][0] +' '+ $L['year'], one:'year', up:10}
				,'1H':{url:'&tbs=qdr:h', txt:$L['last'][0] +' '+ $L['hour'], one:'hour', up:23}
			}, ii =0;
		!sites && delete buttS.site;
		buttSearch.parentNode.style.position ='relative';
		//xLocStor({do:'get', key:'aaa', val:{}, cB: function(dat){console.info(112, dat);}, el: buttSearch.parentNode});
		if(buttSearch && top == self) for(var i in buttS) if(i !='site'|| S.sites){ //buttons under search input line
			var bI = buttS[i]
				, butt2 = $e({clone: i =='site'|| i.length ==2
						? $e({cl: 'siteList', cs: {cursor:'default'}, at: {site: sites[0], date: bI.url} })
						: i !='.. : ..'|| mainPg ? buttSearch : $e({cl: 'siteList hiddn'})
					,clAdd:'xButt'
					,atRemove: ['id', 'name']
					,at: {value: i, innerHTML: '<span class=txt onclick=this.parentNode.click();return!1 title="'
						+(lang || i=='site'|| i=='.. : ..' ? bI.txt :'')+'">'+ i +'</span>'}
					,cs: {position: 'absolute', top: '33px', left: (-127 + 37 * (ii++ - (ii >2 && !mainPg))) +'px'}
					,on: {click: (function(bI, i){
						//console.log('clic:',i,bI)
						return /PDF|site/.test(i)
							? function(ev){
								if(!ev.target.getAttribute('site') || ev.target.getAttribute('site')==$LSettings) return;
								inputSearch.value = inputSearch.value.replace(/ site\:[\w.]+$/i, '')
									.replace(' filetype:pdf', '') +' '
									+ (i =='PDF' ? bI.url : 'site:'+ ev.target.getAttribute('site'));
								if(ev.target.className =='siteList') this.form.click();
							}: !bI.url ? function(ev){
								var el = d.querySelector('#cdrlnk'), o;
								el && el.dispatchEvent(((o = d.createEvent('Events')).initEvent('click', !0, !1), o));
								$pd(ev);
							}: function(ev){
								location.href = '/search?q='+ encodeURIComponent(inputSearch.value)
									+(ev.target.getAttribute('date') + ev.target.getAttribute('site').replace(/\D/g,'') || bI.url);
								$pd(ev);
							}
						})(bI, i),
						mouseover: i =='site' || i.length ==2 ? (function(bI,i){return function(ev){
							clearTimeout(bI.ww);
							ev.currentTarget.querySelector('.list').style.display ='block';
						}})(bI,i) :'',
						mouseout: i =='site' || i.length ==2 ? (function(bI,i){return function(ev){
							var t = ev.currentTarget;
							clearTimeout(bI.ww);
							bI.ww = setTimeout(function(){
								t.querySelector('.list').style.display ='none';
							}, 450);
						}})(bI,i) :'',
						change: function(ev){
							xLocStor({op:'set', key: ev.target.name, val: ev.target.type=='INPUT'&& ev.target.value
								|| ev.target.value.replace(/^[ \n]*|[ \n]*$/g,'').split('\n')
									,cB: function(){console.info('Settings are saved.')}});
							d.querySelector('.siteList .settIn').classList.add('changed');
						} }
					,apT: buttSearch.parentNode
				});
			bI.el = butt2;
			if(i =='site' || i.length ==2){ //dropdown lists under some buttons
				var siteList = $e({cl:'list',cs:{display:'none'}, apT: butt2}), arr =[];
				for(var j =0; j <= bI.up -1; j++) if(i !='1H' || !S.lastHoursLess || j < 8 || j % 2 )
					arr.push((j+1) +' '+ (j % 10 || j==10 ? $L[bI.one +'s'][j % 10 <4 && (j/10|0)!=1 ?0:1] : $L[bI.one]));
				if(!S.sites && i =='1H')
					arr.push($LSettings = $L['Settings']);
				var list = i == 'site' ? sites : arr;
				for(var j in list) if(j !=0)
					var sI = list[j]
						,butt3 = $e({clone: sI==$LSettings
								? $e({cl: 'sett lsb'})
								: buttSearch
							,clAdd:'xButt'
							,atRemove:['id','name']
							,at:{value: sI
								,site: sI
								,date: bI.url
								,title: sI==$LSettings || !lang ?'':(i =='site'?$L['search in']:$L['last'][1]) +' '+ sI
								,innerHTML:'<span class=txt>'+ sI +'</span>'+ (sI != $LSettings &&!(!S.sites && i =='1H')
									?'':'<div class="settIn">'
										+$L.Settings +' '+ $L['of userscript'] +'<br>"Google Search Extra Buttons"<hr>'
										+$L['Interface language'] +': <input size=4 value="'+ lang +'"/><br>' //TODO select Tag for accessible langs
										+$L['Sites'] +': <br><textarea style="width:97%" rows=8>'
											+ strSites +'</textarea><br>'
										+'<a class="reload" href=# onclick="location.reload();return!1">'
											+ $L['reload page for effect'] +'</a>'
									+'</div>')}
							,cs: {position: sI != $LSettings ?'static':'absolute',display:'block', width:'auto', height: sI != $LSettings ?'18px':'16px'
								,margin:'2px 0 -1px -13px', padding:0, textAlign:'left', fontWeight:'normal', opacity:1}
							,apT: siteList
						});
				siteList.style.height ='auto'; siteList.style.textAlign ='center';
			}
		}
	}
});

})({ //write "lang:''," to remove hints; 'en' for English hints (fr - Français, es - espagnol), 'ru' for Russian
	lang:''|| (navigator.languages && navigator.languages[1] || navigator.language.substr(0,2)) //='' if hide hints, or 2 letters from $l{}
	,sites: [ //=array or one site in string
		'slashdot.org','engadget.com','techcrunch.com','habrahabr.ru','geektimes.ru'
		,'smashingmagazine.com','maketecheasier.com'] //write your favorite sites
	,lastHoursLess: 1 //=boolean - not show odd values of hours after 8 h
	,dwmyh: [1,1,1,1,1] //=array of numbers - current vals of days, weeks, months, years, hours
});
