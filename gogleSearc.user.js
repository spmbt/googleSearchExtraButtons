// ==UserScript==
// @name        Google Search Extra Buttons
// @name:ru     GoogleSearchExtraButtons
// @description Add buttons (last 1/2/3 days, weeks, PDF search etc.) for results of Google search page
// @description:ru Кнопки вариантов поиска для результатов Google (1-2-3 дня, недели, PDF, ...)
// @version     17.2015.12.7
// @namespace   spmbt.github.com
// @include     http://www.google.*/search*
// @include     https://www.google.*/search*
// @include     https://www.google.*/*
// @include     https://encrypted.google.*/search*
// @include     https://encrypted.google.*/*
// @include     https://spmbt.github.io/googleSearchExtraButtons/saveYourLocalStorage.html
// ==/UserScript==
if(location.host=='spmbt.github.io'){
	window.addEventListener('message', function(ev){
		if(/^https?:\/\/www\.google\./.test(ev.origin)){
			var d = typeof ev.data =='string' && ev.data[0] =='{' ? JSON.parse(ev.data) : ev.data;
			if(!d.do) return;
			var tok = d.tok, key = d.key;
			switch(d.do){
				case 'set':
					var prev = localStorage[key];
					if(d.val !==undefined)
						localStorage[key] = JSON.stringify(d.val);
					else
						localStorage.removeItem(key);
					break;
				case 'get':
					prev = localStorage[key];
					prev = prev === undefined || typeof prev =='string'&& prev[0] !='{'? prev : JSON.parse(prev);
					break;
				case 'remove':
					prev = localStorage[key];
					if(prev !==undefined)
						localStorage.removeItem(key);
			}
			//console.log('[io]', tok, 'prev=', prev);
			//ev.source.postMessage(JSON.stringify(prev !==undefined ? {tok: tok, prev: prev} : {tok: tok, undef:1}), ev.origin);
		}},!1);
}else

(function(setts){ //lang, sites, lastHoursLess

var $x = function(el, h){if(h) for(var i in h) el[i] = h[i]; return el;} //===extend===
	,$pd = function(ev){ev.preventDefault();}
	,lh = location.href
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
	,listenMsg
/**
 * external localStorage for using another domain if current domain storage is erased anywhere
 * @param{String} h.do - action: set|get|remove
 * @param{String} h.key
 * @param{Object|undefined} h.val (any type)
 * @param{Number|undefined} h.toutLitt
 * @param{Number|undefined} h.tout
 * @param{Function} h.cB - callback with 2 arguments
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
								;//console.warn('toutLitt', h);
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
				//console.log('from_io', JSON.parse(ev.data))
				var resp = ev.data && ev.data[0] =='{' && JSON.parse(ev.data);
				if(!resp) xCatch('bad_format', resp, h);
				if(( qr = qrs[resp.tok] )){
					qrI -= 1;
					qr.cB(resp.prev, resp.undef);
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
		,'Less positions at the end of selects':'Меньше выбора в конце селектов'
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
		,'Less positions at the end of selects':'Moins de choix les longues listes'
		,'Sites':'Les sites'
	},de:{
		'search in PDF files':'suche in PDF-Dateien'
		,'search in':'suche in'
		,'from / to':'im Zeitraum'
		,'last':['letzte','letzte','letzte']
		,'day':'Tag'
		,'days':['Tage','Tage']
		,'week':'Woche'
		,'weeks':['Wochen','Wochen']
		,'month':'Monat'
		,'months':['Monate','Monate']
		,'year':'Jahr'
		,'years':['Jahre','Jahre']
		,'hour':'Stunde'
		,'hours':['Stunden','Stunden']
		,'Settings':'Einstellungen'
		,'of userscript':'von userscript'
		,'reload page for effect':'nachladen Seite für Effekt'
		,'Interface language':'Schnittstellensprache'
		,'Less positions at the end of selects':'Weniger Auswahl in langen Listen'
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
		,'Less positions at the end of selects':'Menos elección en listas largas'
		,'Sites':'Sitios'
	}}; //if !lang, then no hints
addRules('.hp .sfsbc,.sfsbc{display: inline-block}.siteList:hover button{display: block}'
	+'.gb_Ib >.gb_e{height:47px}.gb_Fb{z-index:1087}.tsf-p{z-index:203}'
	+'.lsbb .xButt,.lsbb >.siteList{z-index: 2002; width:34px; height:17px; padding:0 2px; line-height:14px;'
		+'font-size:14px; border:1px solid transparent; background-color:#4889f1; color:#fff; opacity: 0.64}'
	+'.lsbb >.siteList{width:32px; height:auto; padding:1px 0 2px; text-align:center}'
	+'.lsbb >.siteList .lsb{font-weight: normal; color:#d4d4d4}.lsbb .lsb:hover{opacity: 1; color:#fff}'
	+'.siteList .sett .txt{padding: 0 2px}'
	+'.siteList .settIn{display: none; width: 250px; padding: 2px 4px; text-align:left; border:1px solid #48f;'
		+'background-color:#eef; color:#336}'
	+'.siteList .settIn hr{margin:2px 0}'
	+'.sbibtd .sfsbc .nojsb, .siteList .sett:hover .settIn, .siteList .settIn.changed,'
		+'.siteList .settIn.changed .reload{display: block}.siteList .settIn .reload, .siteList.hiddn{display: none}');
xLocStor({do:'get', key:'sett', val:setts, cB: function(prev,undef){
	S = prev || setts;
	S.dwmyh = S.dwmyh || setts.dwmyh; //temp. transitional expr.
	console.timeStamp = function(){};

new Tout({t:120, i:8, m: 1.6
	,check: function(){
		return d && d.getElementsByName('q') && d.getElementsByName('q')[0];
	},
	occur: function(){
		var lang = S.lang != null && S.lang || setts.lang
			,sites = S.sites && (S.sites.length && S.sites[0] || S.sites.length >1) && S.sites
				|| typeof sites =='string'&& [sites] || !S.sites && setts.sites || null;
		var strSites = sites && sites.join('\n').replace(/^\n/,'\n\n') ||''
			,$L = $l[lang] || $l.ru; //default template of lang
		if(!lang || !$l[lang] || lang =='en') for(var l in $L){ //replace 'en' lang for default or substitution
			if($L[l] instanceof Array) for(var l2 in $L[l])
				$L[l][l2] = l;
			else
				$L[l] = l;
		}
		var $LSettings = $L['Settings'];
		if(sites && sites.length)
			sites.push($LSettings)
		var mainPg = /\/search\?/.test(lh)
			,inputSearch = this.dat
			,buttSearch = d.getElementsByName("btnG") && d.getElementsByName('btnG')[0]
			,buttS ={
				PDF:{url:'filetype:pdf', txt:$L['search in PDF files']}
				,site:{url:'site:'+ S.sites[0], txt:$L['search in']+' '+ S.sites[0], one:'day'} //you may comment this line
				,'.. : ..':{url:'', txt:$L['from / to']}
				,'1D':{url:'&tbs=qdr:d', txt:$L['last'][1] +' '+ $L['day'], one:'day', up:13,lett:'D'}
				,'1W':{url:'&tbs=qdr:w', txt:$L['last'][2] +' '+ $L['week'], one:'week', up:14,lett:'W'}
				,'1M':{url:'&tbs=qdr:m', txt:$L['last'][0] +' '+ $L['month'], one:'month', up:20,lett:'M'}
				,'1Y':{url:'&tbs=qdr:y', txt:$L['last'][0] +' '+ $L['year'], one:'year', up:10,lett:'Y'}
				,'1H':{url:'&tbs=qdr:h', txt:$L['last'][0] +' '+ $L['hour'], one:'hour', up:23,lett:'H'}
				,DOC:{url:'filetype:doc', txt:$L['search in PDF files'].replace(/PDF/,'DOC')}
		}, ii = 0, iD = -1;
		!sites && delete buttS.site;
		buttSearch.parentNode.style.position ='relative';
		if(buttSearch && top == self) for(var i in buttS) if(i !='site'|| S.sites){ //buttons under search input line
			if(i.length ==2) iD++; else iD=-1;
			var bI = buttS[i]
				,Gesch = ({m:'letzter',zh:'letzte',sr:'letztes'})['m,zh,m,sr,zh'.split(',')[iD]]
				,butt2 = $e({clone: i =='site'|| i.length ==2
						? $e({cl: 'siteList', cs: {cursor:'default'}, at: {site: S.sites[0], date: bI.url} })
						: i !='.. : ..'|| mainPg ? buttSearch : $e({cl: 'siteList hiddn'})
					,clAdd:'xButt'
					,atRemove: ['id', 'name']
					,at: {value: iD !=-1 && S.dwmyh[iD] !=1 ? S.dwmyh[iD] + bI.lett : i
						,innerHTML: '<span class=txt onclick=this.parentNode.click();return!1 title="' +(lang || i=='site'|| i=='.. : ..'
							? bI.txt.replace(/letzte/,Gesch) :'')+'">'+ (iD !=-1 && S.dwmyh[iD] !=1 ? S.dwmyh[iD] + bI.lett : i) +'</span>'}
					,cs: {position: 'absolute', top: '33px', left: (-127 + 37 * (ii++ - (ii >2 && !mainPg))) +'px'}
					,on: {click: (function(bI, i, iD){
						return /PDF|DOC|site/.test(i)
							? function(ev){
								if(ev.target.className =='defa')
									saveLocStor('','','remove'); $pd(ev);
								if(((ev.target.getAttribute('site') ==null && ev.target.parentNode.getAttribute('site') ==null)
									|| ev.target.getAttribute('site')==$LSettings || ev.target.parentNode.getAttribute('site')==$LSettings)
										&& !/PDF|DOC/.test(ev.target.getAttribute('value'))) return;
								console.log('clic:',i,bI,ev, ev.target.className, inputSearch.value, this.form)
								inputSearch.value = inputSearch.value.replace(/ site\:[\w.]*$/ig, '')
									.replace(/( |\+|&as_)filetype(:|%3A)[^\&]*/g,'') +' '+ (/PDF|DOC/.test(i) ? bI.url
										: 'site:'+ (ev.target.getAttribute('site')||ev.currentTarget.getAttribute('site')||''));
								if(/siteList|xButt/.test(ev.target.className)) this.form.submit();
							}: !bI.url ? function(ev){ //from-to date
								var el = d.querySelector('#cdrlnk'), o;
								el && el.dispatchEvent(((o = d.createEvent('Events')).initEvent('click', !0, !1), o));
								$pd(ev);
							}: function(ev){ //last interval
								location.href = '/search?q='+ encodeURIComponent(inputSearch.value)
									+((ev.target.getAttribute('date')||ev.target.parentNode.getAttribute('date'))
										+ (ev.target.getAttribute('value')||ev.target.parentNode.getAttribute('value')).replace(/\D/g,'') || bI.url)
									+(/[&?]tbm=/.test(lh) ? '&'+/tbm=[^&]*/.exec(lh)[0]:''); //saving type of page
								S.dwmyh[iD] = +(ev.target.getAttribute('value')||ev.target.parentNode.getAttribute('value')).replace(/\D/g,'');
								$pd(ev);
								ev.stopPropagation();
								saveLocStor();
							}
						})(bI, i, iD),
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
						change: saveLocStor
					}
					,apT: buttSearch.parentNode
				});
			bI.el = butt2;
			if(i =='site' || i.length ==2){ //dropdown lists under some buttons
				var siteList = $e({cl:'list',cs:{display:'none'}, apT: butt2}), arr =[];
				for(var j =0; j <= bI.up -1 -(i=='1W'&& S.lastHoursLess ?4:0) -(i=='1M'&& S.lastHoursLess ?9:0); j++)
						if(i !='1H' || !S.lastHoursLess || j < 8 || j % 2 )
					arr.push((j+1) +' '+ (j % 10 || j==10 ? $L[bI.one +'s'][j % 10 <4 && (j/10|0)!=1 ?0:1] : $L[bI.one]));
				//console.log(S.sites,i, S.dwmyh);
				var list = i == 'site' ? sites||[] : i =='1D'&& !sites ? arr.concat([$LSettings]) : arr;
				for(var j in list) if(j !=0 || iD!=-1 && S.dwmyh[iD] !=1)
					var sI = list[j]
						,butt3 = $e({clone: sI==$LSettings
								? $e({cl: 'sett lsb'})
								: buttSearch
							,clAdd:'xButt'
							,atRemove:['id','name']
							,at:{value: sI
								,site: sI
								,date: bI.url
								,title: sI==$LSettings || !lang ?'':(i =='site'?$L['search in']:$L['last'][1]).replace(/letzte/,Gesch) +' '+ sI
								,innerHTML:'<span class=txt>'+ sI +'</span>'+ (sI != $LSettings &&!(!S.sites && i =='1H')
									?'':'<div class="settIn">'
										+$L.Settings +' '+ $L['of userscript'] +'<br>"Google Search Extra Buttons"<hr>'
										+$L['Interface language'] +': <select class="lang" style="width:70px">'
										+(function(){var s='<option'+ (lang=='en'?' selected':'') +'>en</option>';
											for(var i in $l)
												s+='<option'+ (lang==i ?' selected':'') +'>'+ i +'</option>';
											return s +'<option value=""'+ (lang==''?' selected':'') +'>en w/o hints</option>'})()
										+'</select><br>'
										+'<input type="checkbox" class="less" id="hoursLess"'+ (S.lastHoursLess ?' checked':'') +'/>'
											+'<label for="hoursLess">'+ $L['Less positions at the end of selects'] +'</label><br>'
										+'<i><a href="#" class="defa" style="float: right">Default settings</a></i>'
										+$L['Sites'] +': <br><textarea class="sites" style="width:97%" rows=8>'
											+ strSites +'</textarea><br>'
										+'<a class="reload" href=# onclick="location.reload();return!1">'
											+ $L['reload page for effect'] +'</a>'
									+'</div>')}
							,cs: {position: sI != $LSettings ?'static':'absolute',display:'block', width:'auto', height: sI != $LSettings ?'18px':'16px'
								,margin:'2px 0 -1px -13px', padding:0, textAlign:'left', fontWeight:'normal', opacity:1}
							,on:{click: function(ev){$pd(ev)}}
							,apT: siteList
						});
				siteList.style.height ='auto'; siteList.style.textAlign ='center';
			}
		}
	}
});

}, el: d.body});
	var saveLocStor = function(ev, val, do2){ var aaa,aab,aac, t = ev && ev.target.form || document.documentElement || document.body;
		xLocStor({do: do2 ||'set', key:'sett'
			, val:{lang: (aaa=d.querySelectorAll('.lang', t))[aaa.length-1].value
				,sites: (aab=d.querySelectorAll('.sites', t))[aab.length-1].value.replace(/^[ \t]*|[ \n\t]*$/g,'')
						.split('\n')
				,lastHoursLess: (aac=d.querySelectorAll('.less', t))[aac.length-1].checked
				,dwmyh: S.dwmyh || setts.dwmyh
			}
			,cB: function(prev){
				console.info('Settings are saved. prev=', prev);}
		});
		d.querySelector('.siteList .settIn').classList.add('changed');
	};

})({ //write "lang:''," to remove hints; 'en' for English hints (fr - Français, es - espagnol), 'ru' for Russian
	lang:''|| (navigator.languages && navigator.languages[1] || navigator.language.substr(0,2)) //='' if hide hints, or 2 letters from $l{}
	,sites: [ //=array or one site in string
		'slashdot.org','engadget.com','techcrunch.com','habrahabr.ru','geektimes.ru'
		,'smashingmagazine.com','maketecheasier.com'] //write your favorite sites
	,lastHoursLess: 1 //=boolean - not show odd some values of hours after 8 h
	,dwmyh: [1,1,1,1,1] //=array of numbers - current vals of days, weeks, months, years, hours
});
