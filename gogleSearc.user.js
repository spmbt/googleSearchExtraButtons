// ==UserScript==
// @name        Google Search Extra Buttons
// @name:ru     GoogleSearchExtraButtons
// @description Add buttons (last 1/2/3 days, weeks, PDF search etc.) for results of Google search page
// @description:ru Кнопки вариантов поиска для результатов Google (1-2-3 дня, недели, PDF, ...)
// @version     5.2015.10.15
// @namespace   spmbt.github.com
// @include     http://www.google.*/search*
// @include     https://www.google.*/search*
// ==/UserScript==

(function(sett){ //lang, sites, lastHoursLess

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
	 * @param{Number} t start period of check
	 * @param{Number} i number of checks
	 * @param{Number} m multiplier of period increment
	 * @param{Function} check event condition
	 * @param{Function} occur event handler
	 */
	var Tout = function(h){
			var th = this;
			(function(){
				if((h.dat = h.check() )) //wait of positive result, then occurs
					h.occur();
				else if(h.i-- >0) //next slower step
					th.ww = setTimeout(arguments.callee, (h.t *= h.m) );
			})();
		},
		setLocStor = function(name, hh){ if(!localStorage) return;
			localStorage['LE::xButtons_'+ name] = JSON.stringify({h: hh});},
		getLocStor = function(name){
			return (JSON.parse(localStorage && localStorage['LE::xButtons_'+ name] ||'{}')).h;}
		,removeLocStor = function(name){localStorage && localStorage.removeItem('LE::xButtons_'+ name);}
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
		}} //if !lang, then no hints
		,lNoHints ={'from / to':1, 'Settings':1, 'of userscript':1, 'reload page for effect':1, 'Interface language':1, 'Sites':1}
		,lang = getLocStor('lang') || sett.lang
		,sites = (getLocStor('sites') || sett.sites) instanceof Array && (getLocStor('sites') || sett.sites) ||[]
		,strSites = sites.join('\n')
		,$LSettings
		,$L = $l[lang] || $l.ru; //default template of lang
	if(!lang || !$l[lang] || lang =='en') for(var l in $L){ //replace 'en' lang for default or substitution
		if($L[l] instanceof Array) for(var l2 in $L[l])
			$L[l][l2] = l;
		else
			$L[l] = l;
	}
	addRules('.siteList:hover button{display: block}'
		+'.gb_Ib >.gb_e{height:47px}.gb_Fb{z-index:1087}.tsf-p{z-index:203}'
		+'.lsbb .xButt,.lsbb >.siteList{opacity: 0.64; line-height:14px; width:34px; height:17px; padding:0 2px;'
		+'font-size:14px; border:1px solid transparent; background-color:#4889f1; color:#fff}'
		+'.lsbb >.siteList{width:32px; height:auto; padding:1px 0 2px; text-align:center}'
		+'.lsbb >.siteList .lsb{color:#d4d4d4}.lsbb .lsb:hover{opacity: 1; color:#fff}'
		+'.siteList .settIn{display: none; width: 250px; padding: 2px 4px; text-align:left; border:1px solid #48f;'
		+'background-color:#eef; color:#336}'
		+'.siteList .settIn hr{margin:2px 0}'
		+'.siteList .sett:hover .settIn, .siteList .settIn.changed{display: block}'
		+'.siteList .settIn .reload{display: none}.siteList .settIn.changed .reload{display: block}');
	console.log('==sites: ', getLocStor('sites'))
	console.log('==$L: ', $L, lang)
	if(sett.sites)
		sites.push($LSettings = $L['Settings']);
	new Tout({t:120, i:8, m: 1.6
		,check: function(){
			return d && d.getElementsByName("q") && d.getElementsByName('q')[0];
		},
		occur: function(){
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
			if(buttSearch && top == self)
				for(var i in buttS) if(i !='site'|| sett.sites){ //buttons under search input line
					var bI = buttS[i]
						, butt2 = $e({clone: i =='site'|| i.length ==2
							? $e({cl: 'siteList', cs: {cursor:'default'}, at: {site: sites[0], date: bI.url} })
							: buttSearch
							,clAdd:'xButt'
							,atRemove: ['id', 'name']
							,at: {value: i, innerHTML: i, title: lang || i=='site'|| i=='.. : ..' ? bI.txt :''}
							,cs: {position: 'absolute', top: '33px', left: (-127 + 37 * ii++) +'px'}
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
									console.info('Settings are not saved. TODO save to locStor of another site.');
									setLocStor(ev.target.name, ev.target.type=='INPUT'&& ev.target.value
										|| ev.target.value.replace(/^[ \n]*|[ \n]*$/g,'').split('\n'));
									d.querySelector('.siteList .settIn').classList.add('changed');
								} }
							,apT: buttSearch.parentNode
						});
					bI.el = butt2;
					if(i =='site' || i.length ==2){ //dropdown lists under some buttons
						var siteList = $e({cl:'list',cs:{display:'none'}, apT: butt2}), arr =[];
						for(var j =0; j <= bI.up -1; j++) if(i !='1H' || !sett.lastHoursLess || j < 8 || j % 2 )
							arr.push((j+1) +' '+ (j % 10 || j==10 ? $L[bI.one +'s'][j % 10 <4 && (j/10|0)!=1 ?0:1] : $L[bI.one]));
						if(!sett.sites && i =='1H')
							arr.push($LSettings = $L['Settings']);
						var list = i == 'site' ? sites : arr;
						for(var j in list) if(j !=0)
							var sI = list[j]
								,butt3 = $e({clone: sI==$LSettings
									? $e({cl: 'sett lsb'})
									: buttSearch
									,clAdd:'xButt'
									,atRemove:['id','name','date']
									,at:{value: sI
										,site: sI
										,date: bI.url
										,title: sI==$LSettings || !lang ?'':(i =='site'?$L['search in']:$L['last'][1]) +' '+ sI
										,innerHTML: sI +(sI != $LSettings &&!(!sett.sites && i =='1H')
											?'':'<div class="settIn" title="">'
											+$L.Settings +' '+ $L['of userscript'] +'<br>"Google Search Extra Buttons"<hr>'
											+$L['Interface language'] +': <input size=4 value="'+ lang +'"/><br>' //TODO select Tag for accessible langs
											+$L['Sites'] +': <br><textarea style="width:97%" rows=8>'
											+ strSites +'</textarea><br>'
											//+'<a class="reload" href=# onclick="location.reload();return!1">'
											//	+ $L['reload page for effect'] +'</a>'
											+'</div>')}
									,cs: {position: sI != $LSettings ?'static':'absolute',display:'block', width:'auto', height:'18px'
										,margin:'2px 0 -1px -13px', padding:0, textAlign:'left', fontWeight:'normal', opacity:1}
									,apT: siteList
								});
						siteList.style.height ='auto'; siteList.style.textAlign ='center';
					}
				}
			$e({el:d.querySelector('.gb_Ib > .gb_e'),cs:{height:'47px'}} );
			$e({el:d.querySelector('.gb_Fb'),cs:{zIndex:'1087'}} );
			$e({el:d.querySelector('.tsf-p'),cs:{zIndex:'203'}} );
		}
	});

})({ //write "lang:''," to remove hints; 'en' for English hints (fr - Français, es - espagnol), 'ru' for Russian
	lang: ''|| (navigator.languages[1] || navigator.language)
	,sites:['slashdot.org','engadget.com','techcrunch.com','habrahabr.ru','geektimes.ru'
		,'smashingmagazine.com','maketecheasier.com'] //write your favorite sites
	,lastHoursLess:1 // not show odd hours after 8 h.
});


//settings: {lang, $s ={}, lastSelects, sites}; imp/export (thru net also)