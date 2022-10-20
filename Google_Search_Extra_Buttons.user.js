// ==UserScript==
// @name Google Search Extra Buttons
// @name:ru GoogleSearchExtraButtons
// @description Add buttons (past 1/2/3 days, weeks, PDF search etc.) for Google search page
// @description:ru Кнопки вариантов поиска для страницы поиска Google (1-2-3 дня, недели, PDF, ...)
// @version 45.2022.8.23
// @namespace   spmbt.github.com
// @include http://www.google.*/search*
// @include https://www.google.*/search*
// @include https://www.google.*/*
// @include https://encrypted.google.*/search*
// @include https://encrypted.google.*/*
// @include https://spmbt.github.io/googleSearchExtraButtons/saveYourLocalStorage.html
// @include https://www.gstatic.com/sites/p/b9356d/system/services/test.html
// @include https://www.gstatic.com/index.html
// @exclude https://www.google.com/maps/*
// ==/UserScript==
var xLocStI =0, xLocSto = [{origin:'https://spmbt.github.io', restHref:'/googleSearchExtraButtons/saveYourLocalStorage.html'},
	{origin:'https://www.gstatic.com', restHref:'/sites/p/b9356d/system/services/test.html', '//':'blank page'},
	{origin:'https://www.gstatic.com', restHref:'/index.html', '//':'404 page'}];
// For use own eXternal LocalStorage add to array your origin+restHref of site with https protocol,
//   set xLocStI pointed to it, @include directive with this URL. If this script is Chrome extension, fill include_globs in manifest.json.
//   TODO If localStorage will be unavailable, script will be use next indexes of array.
if(location.host == xLocSto[xLocStI].origin.replace(/[^/]*\/\//,'')){
	window.addEventListener('message', function(ev){
		if(/^https?:\/\/www\.google\./.test(ev.origin)){
			var d = typeof ev.data =='string' && ev.data[0] =='{' ? JSON.parse(ev.data) : ev.data;
			if(!d.do) return;
			var tok = d.tok, key = d.key; try{
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
					prev = prev === undefined || typeof prev =='string'&& prev[0] !='{'? prev : JSON.parse(prev); break;
				case 'remove':
					prev = localStorage[key];
					if(prev !==undefined)
						localStorage.removeItem(key);
			}} catch(er){}
			//xLocStI !=0 && console.log('[xLocSto]', tok, 'prev=', prev);
			xLocStI !=0 && ev.source.postMessage(JSON.stringify(prev !==undefined ? {tok: tok, prev: prev} : {tok: tok, undef:1}), ev.origin);
		}},!1); //console.log('[xLocSto-1]_'+ xLocStI);
}else (function(setts){ //lang, sites, lastHoursLess

	var $x = function(el, h){if(h) for(var i in h) el[i] = h[i]; return el;} //===extend===
		,$pd = function(ev){ev.preventDefault();}
		,d = document
		,$q = function(q, el){return (el||d).querySelector(q)}
		,lh = location.href
		,$e = function(g,el){ //===create or use existing element=== //g={el|clone,cl,ht,cs,at,atRemove,on,apT}
			g.el = el || g.el || g.clone ||'DIV';
			var o = g.o = g.clone && g.clone.cloneNode && g.clone.cloneNode(!0)
				|| (typeof g.el =='string' ? d.createElement(g.el) : g.el);
			if(o){ //execute if exist
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
		addRules = function(css){$e({apT: d.getElementsByTagName('head')[0], ap: d.createTextNode(css)},'style')},
//check occurrence of third-party event with growing interval: h.t=time, h.i=count, h.c=check, h.o=occur, h.m=multi
		CS = function(h,d){d?h.o(d):h.i--&&setTimeout(function(){CS(h,h.c())},h.t*=h.m)} //example: t:120, i:12, m: 1.6 => wait around 55 sec
//for xLocStor:
		,xLocStorOrigin = d.location.protocol + xLocSto[xLocStI].origin.replace(/[^/]*/,'')
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
					,src: xLocStorOrigin + xLocSto[xLocStI].restHref},
				cs: {display: 'none'},
				on: {load: query},
				apT: el || d.body
			});
			if(!listenMsg) addEventListener('message', function(ev){
				if(ev.origin == xLocStorOrigin){   // {"tok":"<value>"[,"err":"<txt>"],"h":...}
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
		//$('#xLocStor').contentWindow.postMessage('{"do":"get","key":"googXButtons_dwmyh"}',xLocSto[xLocStI].origin)
		xCatch = function(er, resp, h){
			if((errIMax -= 1) >=0)
				console.error('tok:', resp && resp.tok ||'--','; err:', er,'; h:', h,'; respH:', resp && resp.h);
			chkErrMax();
		},
		chkErrMax = function(){if(!errIMax) console.error('Too many err messages:', errNMax)}
		,fileType ='PDF,DOC,RTF,ODF,XLS,ODS,PPT,ODP,TXT,XML,More...,  KML,DWF,PS,WPM,BAS,C,CC,CPP,CXX,  Java,PL,PY,H,HPP,CS'
			.split(/,\s*/).map(function(x){return '&nbsp;'+x+'&nbsp; '})
		,isFTMore =0
		,meta={Goog:'',Duck:'',Bing:'',Ask:'',Baidu:'',Yandex:'',Mailru:'',SlideS:''} //will create child-tabs (window names)
		,imgFile='SVG,JPG,GIF,PNG,BMP,webp,ICO,RAW'.split(',').map(function(x){return '&nbsp;'+x+'&nbsp; '}) //will switch to Img Search
		,imgType='face,clipart,photo,lineart,animated'.split(',') //for Img Search (+imgColor,imgSize,imgSizeLt)
		,imgColor='red,orange,yellow,green,teal,blue,purple,pink,white,gray,black,brown'.split(',')
		,imgSize='l,m,small,icon,>=,Exact...'.split(',')
		,imgSizeLt='vga,svga,xga,2mp,4mp,qsvga'.split(',')
		,$l ={ru:{
			'search in PDF files':'поиск по документам PDF'
			,'search in':'искать по'
			,'More':'Ещё'
			,'search black/white':'искать чёрно-белые'
			,'return to colored':'вернуться к цветным'
			,'from / to':'за период'
			,'past':['за последний','за последние','за последнюю']
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
			,'Gray design of buttons':'Серый дизайн кнопок'
			,'Show Filetype Button':'Кнопка типов файлов'
			,'Sites':'Сайты'
		},fr:{
			'search in PDF files':'la recherche dans les fichiers PDF'
			,'search in':'rechercher dans'
			,'More':'Plus'
			,'search black/white':'trouver noir et blanc'
			,'return to colored':'retour à la couleur'
			,'from / to':'pour la période'
			,'past':['le dernier','dans les derniers','dans les derniers']
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
			,'Gray design of buttons':'Gris design des boutons'
			,'Show Filetype Button':'Bouton Types de fichiers'
			,'Sites':'Les sites'
		},de:{
			'search in PDF files':'Suche in PDF-Dateien'
			,'search in':'Suche in'
			,'More':'Mehr'
			,'search black/white':'schwarz und weiß finden'
			,'return to colored':'zurück zur Farbe'
			,'from / to':'im Zeitraum'
			,'past':['letzte','letzte','letzte']
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
			,'of userscript':'von Userscript'
			,'reload page for effect':'Seite neu laden'
			,'Interface language':'Sprache'
			,'Less positions at the end of selects':'Weniger Auswahl in langen Listen'
			,'Gray design of buttons':'Graues Design der Schaltflächen'
			,'Show Filetype Button':'Schaltfläche Dateitypen'
			,'Sites':'Websites'
		},es:{
			'search in PDF files':'búsqueda en archivos PDF'
			,'search in':'busca en'
			,'More':'Más'
			,'search black/white':'encontrar blanco y negro'
			,'return to colored':'volver al color'
			,'from / to':'para el período'
			,'past':['el último','en los últimos','en los últimos']
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
			,'Gray design of buttons':'Diseño gris de botones'
			,'Show Filetype Button':'Botón de tipos de archivo'
			,'Sites':'Sitios'
		}},cB; //if !lang, then no hints
	var bBack = /^(?:rgba?\((\d+)|#(.))/.exec(window.getComputedStyle(d.body).backgroundColor.replace(/gb/,'gba')), // for Images tab
		mDark = (d.querySelectorAll('meta[name="color-scheme"]')[0]||{}).content==='dark'|| bBack && (bBack[1] && bBack[1] <96 || bBack[2] && bBack[2] <6);
	addRules('.hp .sfsbc,.sfsbc{display:inline-block}.siteList:hover button{display:block}'
		+'.gb_Ib >.gb_e{height:47px}.gb_Fb{z-index:1087}.tsf-p{z-index:203}'
		+'.lsbb .xButt,.lsbb >.siteList,.sbibod .xButt,.sbibod >.siteList   {z-index:2002; width:34px; height:17px;'
			+'padding:0 2px; line-height:14px; font-size:14px; border:1px solid transparent; border-radius:2px;'
			+'background-color:#dddae6; color:#eee; opacity:.07; transition:opacity .57s ease-in}'
		+'.lsbb >.siteList:hover   {background-color:#4889f1}'
		+'.lsbb >.siteList,.sbibod >.siteList   {width:32px; height:auto; padding:1px 0 2px; text-align:center}'
		+'.lsbb >.siteList .lsb >.txt.or   {visibility:hidden; position:relative; left:3px; top:-2px; margin-left:-14px;'
			+'font-size:9px; font-variant:small-caps; border:1px solid rgb(72, 137, 241); border-radius:8px;'
			+'background-color:rgba(233, 238, 247, 0.66); color:rgb(131, 105, 68)}.lsbb >.siteList .lsb >.txt.or.sit   {left:-1px}'
		+'.lsbb >.siteList .selted .lsb:not(.more):not(.moreShow):not(.sett):hover >.txt.or   {visibility:visible}'

		//deprecated gray design
		+'.lsbb .xButt:hover,.sbibod .xButt:hover,.xButt.xButt2:hover .xButt2,.xButt2:hover{background-color:#c3d4e1; color:#fff; opacity:1}'
		+'.xButt2{padding:0 0 2px; background-color:#dad6e2; color:#eee; opacity:1}'
		+'.sbibod.lsbb{height:44px}'
		+'.sbibod .xButt:hover,.sbibod .xButt2:hover,.sbibod .xButt:hover .xButt2{background-color:#c3c6c7}'
		+'.sbibod:not(.lsbb) >.siteList, .sbibod:not(.lsbb) >.xButt2{background-color:#dddae6; opacity:.45}'
		+'.sbibod:not(.lsbb) >.siteList:hover, .sbibod:not(.lsbb) >.xButt2:hover{background-color:#dddae6; opacity:.87}'
		+'.sbibod >.siteList >.list{background-color:#e1deeb}'
		+'.sbibod >.siteList.fade:hover{opacity:1; transition:opacity .1s ease-in}'
		+'.sbibod >.siteList.fade{opacity:0.23}'

		+'.list .more ~.xButt{display:none!important}'
		+'.list .moreShow ~ .xButt{position:absolute!important; left:52px; height:19px!important}'
		+'.list .moreShow~.x2.xButt, .list .moreShow~.x2 ~.xButt{left:99px}'
		+'.siteList .sett .txt{padding:2px 2px 4px; font-size:14px}'
		+'.siteList .settIn{display:none; width:250px; padding:2px 4px; text-align:left; border:1px solid #48f; font-size:14px;'
			+'background-color:#dde; color:#336}'
		+'.siteList .settIn hr{margin:2px 0}'
		+'.sbibtd .sfsbc .nojsb, .siteList .sett:hover .settIn, .siteList .settIn.changed,'
		+'.siteList .settIn.changed .reload{display:block}.siteList .settIn .reload, .siteList.hiddn{display:none}'
		+'div.gb_g[aria-label="promo"],.pdp-psy.og-pdp, .gb_Sc.gb_g .gb_ha, .gb_g.gb_ha:not(.xpdopen ){display:none}'
		+'.xpdopen{display:block!important}.rhsvw{opacity:.16; transition:.4s}.rhsvw:hover{opacity:1}'
		+'.srp #sfdiv{overflow:inherit}' //hide promo
		+'.UUbT9 >div.aajZCb{background-color:rgba('+(mDark?'40,44,48, 0.92':'255,255,255, 0.75')+');}' //opacity for suggests
		+'.UUbT9 ul li div span b{background-color:rgba('+(mDark?'88,93,99':'237,242,248')+', 0.9); margin:0 -6px 0 4px; padding:0 6px 0 0;border-radius:7px;}' //white under suggest texts
		+'.gb_kb{padding-left:10px; padding-right:7px}form .RNNXgb{position:relative; background:rgba('+(mDark?'40,44,48':'255,255,255')+', 0.92)}'
		+'.RNNXgb, #tsf{width:auto!important} #searchform form#tsf{max-width:auto} body div#searchform,body  .ctr-p{min-width:0}'
		+'div#searchform.minidiv{top:-8px!important}.minidiv .sfbg{margin-top:-26px!important}' // for  narrow sticked searchbar
		+'.minidiv .sfbg{top:-39px}.minidiv .sfbg +form#tsf{top:-39px}.minidiv .sfbg +form#tsf:hover{top:0}' //hide sticked
		+'.minidiv .sfbg +form#tsf:hover .siteList, .minidiv .sfbg +form#tsf:hover .lsbb >.xButt   {top:-6px!important}'
		+'.RNNXgb .Tg7LZd   {flex:0 0 auto; visibility:hidden; width:44px; height:44px; margin-right:-31px; padding:0 13px 0 0;'
		+'	 border-radius:0 8px 8px 0; background:transparent; border:none; outline:none}'
		+'.emcav div.RNNXgb   {z-index:998; box-shadow:0 -1px 4px 0 rgba(32,33,36,0.28)}'
		+'.minidiv .RNNXgb   {z-index:998}.minidiv .RNNXgb:hover   {box-shadow:0 -1px 4px 0 rgba(32,33,36,0.28)}'
		+'.A8SBwf .logo +.RNNXgb .Tg7LZd   {visibility:visible; margin-right:-9px; margin-bottom:-2px; transition:margin 5s ease-in-out}');
	try{xLocStor({do:'get', key:'sett', val:setts, cB: cB=function(prev,undef){
		S = prev || setts;
		S.dwmyh = S.dwmyh || setts.dwmyh; //temp. transitional expr.
		console.timeStamp = function(){};
		addRules(!(S.whiteMintOval || S.whiteMintOval===undefined) ? //blue old design
		'.lsbb .xButt:not(.xButt2),.lsbb >.siteList,.sbibod .xButt:not(.xButt2)   {text-align:center; background-color:#4889f1; color:#fff; opacity:0.75}'
		+'.lsbb >.siteList .lsb,.sbibod >.siteList .lsb   {font-weight:normal; color:#d4d4d4}'
		+'.lsbb .lsb:hover,.sbibod .lsb:hover   {opacity:1; color:#f1c44a; cursor:default}'
		+'.lsbb >.siteList >div:not([class]):hover,.sbibod >.siteList:hover   {background-color:#c2d4e0; color:#f7f7f7; opacity:.93}'
		+'.lsbb >.siteList >div:not([class]):hover span   {color:#aa6c1c}'
		+'.lsbb >.siteList .sett .txt{background-color:#4889f1}'
		//white-mint-oval design
		:'.lsbb .xButt:not(.xButt2), .lsbb >.siteList   {text-align:center; background-color:rgb('
			+(mDark?'92,100,110':'240,247,248')+'); opacity:0.75; color:rgb('+(mDark?'40,44,48':'137,137,137')+')}'
		+'.lsbb >.siteList   {border:1px solid rgb('+(mDark?'87,97,108':'183,219,205')+'); border-radius:10px; background-color:rgba('
			+(mDark?'86,89,92':'243,243,243')+',0.7); color:rgb('+(mDark?'140,154,173':'75,143,231')+')}'
		+'.lsbb >.siteList .lsb   {font-weight:normal; border:1px solid rgb('+(mDark?'98,98,90':'210,210,190')
			+'); border-radius:10px; background-color:rgb('+(mDark?'77,84,89':'225,239,239')+'); color:rgb(140, 140, 140)}'
		+'.lsbb .lsb:hover   {opacity:1; color:rgb(152, 123, 43); cursor:default}'
		+'.lsbb >.siteList:hover   {background-color:rgb('+(mDark?'87,97,108':'183,219,205')+')}'
		+'.lsbb .xButt:hover   {background-color:rgb(221, 230, 228)}'
		+'.lsbb >.siteList >div:not([class]):hover span   {color:rgb('+(mDark?'233,140,19':'170,108,28')+')}'
		+'.lsbb >.siteList .sett .txt   {position:relative; top:2px; margin:0 -2px; padding:1px;' +
			'border:1px solid rgb('+(mDark?'87,97,108':'183,219,205')+'); border-radius:10px; background-color:rgb('+(mDark?'92,100,110':'240,247,248')+')');
		CS({t:120, i:12, m: 1.6
			,c: function(){
				return d && d.getElementsByName('q') && !/[?&]tbm=(shop|bks|fin)/.test(lh) && d.getElementsByName('q')[0];
			},
			o: function(dat){
				var lang = S.lang != null ? S.lang : setts.lang
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
				var srch = $q('.RNNXgb')
					,startPg = srch && !$q('button', srch) || /\/(web|img)hp/.test(lh);
				if(startPg){
					//console.log('==-==startPg', srch);
					$e({el:'button', cl:'Tg7LZd', at: {'aria-label':'Google Search', type:'button', jsname:'Tg7LZd'
						,innerHTML:'<div class="gBCQ5d"><span class="z1asCe MZy1Rb">sr</span></div>'}
						, apT: srch});
				}
				var $LSettings = $L['Settings'];
				if(sites && sites.length)
					sites.push($LSettings);
				var mainPg = /\/search\?|&q=|#q=/.test(lh)
					,inputSearch = dat
					,layout1811 = $q('.Tg7LZd') || $q('button[aria-label="Google Search"]') || $q('button[jsname="Tg7LZd"]')
					,design1612 = ($q('#_fZl') || $q('.sbico-c')) && !layout1811
					,d16 = (design1612 || layout1811) && S.design1612
					,imSrch = /[?&]tbm=isch|\/imghp/.test(lh) // sizes are shown if images (outdated): /[&?]tbs[^&]*?(=|,|%2C)imgo(:|%3A)1/i
					,imgTools = imSrch && /[&?]tbs=[^&]*/.exec(lh) //'tbs' with all params
					,isBWShown = imgTools && /[&?]tbs[^&]*?(=|,|%2C)ic(:|%3A)gray/i.exec(lh) // Black-White Images search
					,buttSearcStart = startPg && layout1811 && ($q('input[name="btnK"]') || $q('input[aria-label="Google Search"]')) || $q('button[jsname="Tg7LZd"]') //for the start page
					,buttSearch = d.getElementsByName('btnG') && d.getElementsByName('btnG')[0] || design1612 || layout1811
				,buttS ={
					Srch:{url:'', txt:'search'}
					,PDF:{url:'filetype:PDF', txt:$L[imSrch?(isBWShown ?'hide':'show') +' sizes':'search in PDF files']}
					,site:{url:'site:'+ S.sites[0], txt:$L['search in']+' '+ S.sites[0], one:'day'} //you may comment this line
					//,'.. : ..':{url:'', txt:$L['from / to']}
					,'1D':{url:'&tbs=qdr:d', txt:$L['past'][1] +' '+ $L['day'], one:'day', up:13,lett:'D'}
					,'1W':{url:'&tbs=qdr:w', txt:$L['past'][2] +' '+ $L['week'], one:'week', up:14,lett:'W'}
					,'1M':{url:'&tbs=qdr:m', txt:$L['past'][0] +' '+ $L['month'], one:'month', up:20,lett:'M'}
					,'1Y':{url:'&tbs=qdr:y', txt:$L['past'][0] +' '+ $L['year'], one:'year', up:15,lett:'Y'}
					,'1H':{url:'&tbs=qdr:h', txt:$L['past'][0] +' '+ $L['hour'], one:'hour', up:23,lett:'H'}
				}, ii = -1, iD = -1;
				if((design1612 || layout1811) && !d16 && buttSearch && buttSearch.parentNode)
					buttSearch.parentNode.className +=' lsbb';
				!sites && delete buttS.site;
				if(!layout1811 && buttSearch && buttSearch.parentNode){ buttSearch.parentNode.style.position ='relative';
					buttSearch.parentNode.style.zIndex ='1003';}
				if(buttSearch && top == self) for(var i in buttS) if(i=='site'&& !S.sites || !imSrch || i !='1H'){++ii; //buttons under search input line
					if(i.length ==2) iD++; else iD=-1;
					var bI = buttS[i]
						,Gesch = ({m:'letzter',f:'letzte',n:'letztes'})['m,f,m,n,f'.split(',')[iD]]
						,hint = function(j){return (j+1) +' '+ (j % 10 || j==10 ? $L[bI.one +'s'][j % 10 <4 && (j/10|0)!=1 ?0:1] : $L[bI.one]) }
						,csLeft = function(ii,a){a = -127 + 37 * (ii -1); return design1612 || layout1811 ?{right: -a+33+'px'}
							:{left: a+'px'}}
						,isBWShown2 = isBWShown && i=='PDF'
						,butt2 = $e({clone: i =='site'|| i.length ==2 || i=='PDF'
							? $e({cl: 'siteList', cs: {cursor:'default'}, at: {site: S.sites[0], date: bI.url} })
							: i !='.. : ..'|| mainPg ? $e({el:'button', cl: 'xButt ' +(d16 ?'xButt2':'lsb')}) : $e({cl: 'siteList hiddn'})
						,at: {value: iD !=-1 && S.dwmyh[iD] !=1 ? S.dwmyh[iD] + bI.lett : i
							,innerHTML: '<div'+ (d16 ?' class=xButt2':'') +'><s'+ (isBWShown2?'':'pan') +' class=txt onclick=this.parentNode.click();return!1 title="'
							+(lang || i=='site'|| i=='.. : ..'
								? ((iD==-1 || S.dwmyh[iD]==1 ? bI.txt : $L['past'][1] +' '+ hint(S.dwmyh[iD]-1))||'').replace(/letzte/,Gesch) :'')
							+'" itrvNum="'+ (i=='site'?'': bI.url + (imSrch?'': S.dwmyh[iD])) +'">'
							+(iD !=-1 && S.dwmyh[iD] !=1 ? S.dwmyh[iD] + bI.lett : imSrch && i=='PDF' ?'B/W': i) +(isBWShown2?'</s>':'</span>')+'</div>'}
						,cs: $x({position:'absolute', top:startPg ?'40px':'33px',wordSpacing:'-1px',
							visibility: ii <= S.hiddenEdgeLeft ?'hidden':'visible'}, $x(csLeft(ii),
							ii===2 ? {width:'26px', marginRight:'3px', borderRadius:'2px', lineHeight:'0.75em', marginTop:'0.125em'}:{}))
						,on: {click: (function(bI, i, iD){
							//console.log('clic0:', i, iD);
							return /Srch|PDF|DOC|site/.test(i)
								? function(ev){
									var t = ev.target;
									//console.log('cli-DocSite: i,t.class,value,ev,attrSite,$LS,aPSite,bSSta',i, t.className, inputSearch.value,ev, 'attrSite:'
									//	,t.getAttribute('site'),'aP:', t.parentNode.getAttribute('site'), buttSearcStart);
									if(t && t.className =='defa')
										saveLocStor('','','remove'); $pd(ev);
									if(t && (t.getAttribute('site')==$LSettings || t.parentNode && t.parentNode.getAttribute('site')==$LSettings)
										&& !/Srch|PDF|DOC/.test(i)) return;
									if(t.classList.contains('settIn')||t.parentNode.classList.contains('settIn')){ev.stopPropagation();return;}
									if(t && t.className !='txt')
										inputSearch.value = (inputSearch.value||'').replace(/( site(:|%3A)\s*\S*|$)/ig, /Srch|site/.test(i)?'':'$1').replace(/( |\+|&as_)filetype(:|%3A)[^\&]*/g,'')
											+' '+ (/Srch|PDF|DOC/.test(i) ? imSrch ?'': bI.url
											: 'site:'+ (t && (t.getAttribute('site')|| t.parentNode && t.parentNode.getAttribute('site'))||''));
									if(t && (t.getAttribute('site') ==null && t.parentNode && t.parentNode.getAttribute('site') ==null && !/Srch|PDF|DOC/.test(i)))
										return;
									if(imSrch && i=='PDF'){
										ev.stopPropagation();
										saveLocStor();
										location.href = isBWShown ? lh.replace(new RegExp(imgTools[0]), imgTools && imgTools[0]
												.replace(/(,|%2C)?ic(:|%3A)gray/ig,'').replace(/([?&])tbs=?,?(&|$)/,'$1')) //return to colored
											: imgTools ? imgTools && lh.replace(new RegExp(imgTools[0]), imgTools[0] + (imgTools[0].length <5 ?'':',') +'ic:gray') //upd.'Show'
												: lh + (/\?/.test(lh) ?'&':'?') +'tbs=ic:gray'; //new Tools-More_tools_Show_sizes
									}else if(t && /xButt|txt/.test(t.className) && !(i=='site'&& !(/list/.test(t.parentNode.className)
										|| /list/.test(t.parentNode.parentNode.className))) || t && /Srch|PDF|DOC/.test(t.value))
										/*console.log('==startSrch'),*/(buttSearcStart || buttSearch).click();
								}: !bI.url ? function(ev){ //from-to date (! not used now)
										var el = $q('#cdrlnk'), o;
										el && el.dispatchEvent(((o = d.createEvent('Events')).initEvent('click', !0, !1), o));
										$pd(ev);
									}: function(ev){ //past interval
										var t = ev && ev.target, sbd = /,sbd:1/.test(lh), ta = t
											,tOvr = t && t.parentNode, tOv0 = tOvr
											,date2 = tOvr && tOvr.getAttribute('date');
										var l2 = startPg ? lh.replace(/^([^/]*)\/\/([^/]+)\/?([^?#]*)([?#]?.*)/, '$1//$2/search$4') : lh; // insert '/search?' instead any
										//console.log('cli-Past: value,date2,siteList,list,l2',inputSearch.value,date2,tOvr.classList.contains('siteList'), t.classList.contains('list'), l2);
										if(tOvr && tOvr.classList.contains('siteList') && !ta.classList.contains('list')){ //clicked by top button
											var elTop = $q('div:not(.list) >.txt', tOvr) ||''
												,itrvNum = elTop && elTop.getAttribute('itrvNum') ||''
												,newSrch = /[?&]q=/.test(l2) ? l2.replace(/(&|\?)q=([^&]*)(&|$)/g,'$1q='+ encodeURIComponent(inputSearch.value) +'$3') //add value to '[?&]q=[^&]*'
													: l2 + (/\?/.test(l2) ?'&':'?') +'q='+ encodeURIComponent(inputSearch.value); //set new value as &q=.+
											if(layout1811 && itrvNum !=='' && date2)
												location.href = /qdr(:|%3A)([dwmyh])\d*/.test(l2)
													? newSrch.replace(/([?&]tbs=)?qdr(:|%3A)[dwmyh]\d*/
														,function(x){return itrvNum.replace(/&/, /\?/.test(x) ?'?':'&')}) //patch date in URL
													: newSrch + (/\?/.test(newSrch) ?'&':'?') + itrvNum; //add date in URL
											if(itrvNum != null) S.dwmyh[iD] = +(itrvNum ||'').replace(/\D/g,'');
										}else if(t.textContent || tOv0.textContent){
											var sa = (t.textContent || tOv0.textContent ||'').replace(/\D/g,'');
											if(sa.length <=6)
												S.dwmyh[iD] = +sa;
										}
										//console.log('==noDocNoSite', tOvr.value, itrvNum);
										$pd(ev);
										ev.stopPropagation();
										saveLocStor();
									}
						})(bI, i, iD),
							mouseover: i =='site' || i.length ==2 || i=='PDF' ? (function(bI,i){return function(ev){
									clearTimeout(bI.ww);
									var t = ev.currentTarget;
									t.classList.add('fade');
									$q('.list', t).style.display ='block';
								}})(bI,i) :'',
							mouseout: i =='site' || i.length ==2 || i=='PDF' ? (function(bI,i){return function(ev){
									var t = ev.currentTarget;
									clearTimeout(bI.ww);
									bI.ww = setTimeout(function(){
										$q('.list',t).style.display ='none';
										t.classList.remove('fade');
									}, 570);
								}})(bI,i) :'',
							change: saveLocStor
						}
						,apT: buttSearch.parentNode
					});
					bI.el = butt2;
					if(i =='site' || i.length ==2 || i =='PDF'){ //dropdown lists under some buttons
						//TODO 'list selted' will be placed if search by filetype or by site was presented (and accordingly buttons will be with 'selted')
						var siteList = $e({cl:'list',cs:{display:'none'}, apT: butt2}), arr =[];
						for(var j =0; j < (imSrch ?1: bI.up -(i=='1W'&& S.lastHoursLess ?4:0) -(i=='1M'&& S.lastHoursLess ?9:0) -(i=='1Y'&& S.lastHoursLess ?5:0)); j++)
							if(i !='1H' || !S.lastHoursLess || j < 8 || j % 2 )
								arr.push(hint(j));
						//console.log(S.sites,i, S.dwmyh);
						var list = i=='site' ? sites ||[] : i =='1D'&& !sites ? arr.concat([$LSettings])
							: i=='PDF'? imSrch ? imgFile : fileType : arr,
							fTMoreX2 =0;
						for(var j in list) if(j !=0 || iD!=-1 && S.dwmyh[iD] !=1){
							//console.log('==i,sI', i, sI);
							fTMoreX2 = /CPP/.test(fTyp) || fTMoreX2;
							var sI = list[j]
								,fTyp = sI.replace(/&nbsp; ?/g,'')
								,fTMore = /More\.\.\./.test(fTyp)
								,butt3 = $e({clone: sI==$LSettings ? $e({cl: 'sett' +(d16 ?' xButt xButt2':' lsb')})
									: $e({el:'button', cl: 'xButt' +(d16 ?' xButt2':' lsb') +(fTMore ?' more':'') +(fTMoreX2 ?' x2':'')})
								,at:{value: sI
									,site: sI
									,date: bI.url.replace(/pdf$/i, fTyp)
									,title: sI==$LSettings || !lang ?'':(/site|PDF/.test(i)
										? ($L[i=='PDF'?'search in PDF files':'search in'] +(i=='PDF'?'':' '+ sI)).replace(/PDF/,fTyp)
											: j==0 ? bI.txt : $L['past'][1] +' '+ sI).replace(/letzte/,Gesch)
									,innerHTML: (/site|PDF/.test(i) ?'<span class="txt or'+(i=='PDF'?'':' sit')+'" data-val="'+ sI.replace(/&nbsp; ?/g,'') +'" title="' //multiselect mechanics
											+(1 ?(i=='PDF'?'':'sites ') +'multiselect'+ (i=='PDF'?' of types':''):'click to disable select')
											+'">'+(1 ?'OR':'V')+'</span>':'')
										+'<span class=txt>'+ sI +'</span>'+ (sI != $LSettings &&!(!S.sites && i =='1H')
										?'':'<div class="settIn">'
										+$L.Settings +' '+ $L['of userscript'] +'<br/>"Google Search Extra Buttons"<hr/>'
										+$L['Interface language'] +': <select class="lang" style="width:70px">'
										+(function(){var s='<option'+ (lang=='en'?' selected':'') +'>en</option>';
											for(var i in $l)
												s+='<option'+ (lang==i ?' selected':'') +'>'+ i +'</option>';
											return s +'<option value=""'+ (lang==''?' selected':'') +'>en w/o hints</option>'})()
										+'</select><br/>'
										+'<input type="checkbox" class="less" id="hoursLess"'+ (S.lastHoursLess ?' checked':'')+'/>'
											+'<label for="hoursLess" id="hoursLessL">'+ $L['Less positions at the end of selects'] +'</label><br/>'
										+'<input type="checkbox" class="des16" id="design1612"'+ (/*!layout1811 &&*/ S.design1612 ?' checked':'')+ (1?' disabled':'')+'/>'
										+'<input type="checkbox" class="des18" id="whiteMintOval"'+ (S.whiteMintOval || S.whiteMintOval===undefined ?' checked':'')+'/>'
											+'<label for="whiteMintOval" id="whiteMintOvalL">'+ $L['Gray design of buttons'] +'</label><br/>'
										+'<input type="checkbox" class="butTyp" id="butTypes"'+ (S.hiddenEdgeLeft ?'':' checked')+'/>'
											+'<label for="butTypes" id="butTypesL">'+ $L['Show Filetype Button'] +'</label><br/>'
										+'<i><a href="#" class="defa" style="float: right">Default settings</a></i>'
										+$L.Sites +': <br/><textarea class="sites" style="width:97%" rows=8>'
										+ strSites +'</textarea><br/>'
										+'<a class="reload" href=# onclick="location.reload();return!1">'
										+ $L['reload page for effect'] +'</a>'
										+'</div>')}
								,cs: Object.assign({position: (sI != $LSettings || design1612 || layout1811)&& !fTMore ?'static':'absolute',display:'block'
									,width: sI != $LSettings ?'auto': /en|es/.test(lang)||!lang ?'3em':'4em'
									,height: sI != $LSettings ?'18px':'16px',margin:'2px 0 -1px -13px', padding:'0 2px 0 1px', minWidth:'42px'
									,top: (19* j - 175 - 133* fTMoreX2) +'px'
									,textAlign:'left', fontWeight:'normal', opacity:1, whiteSpace:'nowrap'}, fTMore ?{top:'18px',left:'47px'}:{})
								,on:{click: (function(fTyp,pdf,fTMore){return function(ev){var t = ev.target;
									var less = $q('#hoursLess')
										,des16 = $q('#design1612') //&& !layout1811
										,des18 = $q('#whiteMintOval')
										,butTyp = $q('#butTypes')
										,itrv = t.getAttribute('date')||t.parentNode.getAttribute('date')||''
										,num = (t.getAttribute('site')||t.parentNode.getAttribute('site')||'').replace(/site/.test(itrv)?/^/:/\D/g,'');
									//console.log('==clic3:t,itrv,num,fTyp,pdf:',t, itrv, num,'|',fTyp,pdf);
									if(t.classList.contains('sett')||t.parentNode.classList.contains('sett')){ev.stopPropagation();return;}
									if(less && /hoursLess/.test(t.id)){
										less.outerHTML = '<input type="checkbox" class="less" id="hoursLess"'
											+(less.getAttribute('checked')!=null ?'':' checked="checked"')+'/>';
										saveLocStor();}
									if(des16 && /design1612/.test(t.id)){
										des16.outerHTML = '<input type="checkbox" class="des16" id="design1612"'
											+(des16.getAttribute('checked')!=null ?'':' checked="checked"')+'/>';
										saveLocStor();}
									if(des18 && /whiteMintOval/.test(t.id)){
										des18.outerHTML = '<input type="checkbox" class="des18" id="design1612"'
											+(des18.getAttribute('checked')!=null ?'':' checked="checked"')+'/>';
										saveLocStor();}
									if(butTyp && /butTypes/.test(t.id)){
										butTyp.outerHTML = '<input type="checkbox" class="butTyp" id="butTypes"'
											+(butTyp.getAttribute('checked')!=null ?'':' checked="checked"')+'/>';
										saveLocStor();}
									if(pdf || /site/.test(itrv)) {//console.log('==pdf|site');
										inputSearch.value = inputSearch.value.replace(new RegExp('(?:(\\s+OR\\s+)?\\s*'
											+(pdf ?'filetype':'site')+'(?::|%3A)\\s*\\S*)+|$','g')
											,s1 => fTMore || s1 ?'':' '+ (imSrch? itrv.toLowerCase() + num : itrv +(pdf ?'': fTyp)));}
									var l2 = startPg ? lh.replace(/^([^/]*)\/\/([^/]+)\/?([^?#]*)([?#]?.*)/, '$1//$2/search$4') : lh // insert '/search?' instead any
										,newSrch = /[?&]q=/.test(l2) ? l2.replace(/(&|\?)q=([^&]*)(&|$)/g,'$1q='+ encodeURIComponent(inputSearch.value) +'$3') //add value to '[?&]q=[^&]*'
											: l2 + (/\?/.test(l2) ?'&':'?') +'q='+ encodeURIComponent(inputSearch.value); //set new value as &q=.+
									//console.log('==inputSearch.value,newSrch,fTyp,pdf,num', inputSearch.value, newSrch, fTyp, pdf, num);
									if(pdf && !fTMore || num !==''&& num != +num){ev.stopPropagation();}
									if(buttSearcStart && (pdf && !fTMore || num !==''&& num != +num)){buttSearcStart.click();return}
									if(layout1811 && num !==''|| pdf) {pdf && ev.stopPropagation();
										if(!fTMore) location.href = /qdr(:|%3A)([dwmyh])\d*/.test(l2)
											? newSrch.replace(/([?&]tbs=)?qdr(:|%3A)[dwmyh]\d*/
												,function(x){return pdf ?'': (itrv + (imSrch?'': num)).replace(/&/, /\?/.test(x) ?'?':'&')}) //patch date in URL
											: newSrch + (/\?/.test(newSrch) ?'&':'?') + (pdf ?'': itrv + (imSrch?'': num)); //add date in URL
										else{if(t.classList.contains('txt')) {if(t.parentNode.classList.contains('more')) t.parentNode.className ='xButt lsb moreShow';
											else t.parentNode.className ='xButt lsb more';} //'className' because bug of Chrome in upper line with .toggle
												else {if(t.classList.contains('more')) t.className ='xButt lsb moreShow';
											else t.className ='xButt lsb more';}}} //bug of Fx with .toggle,.toggle - list is changed slow (0.4 s)
									$pd(ev);
								}})(fTyp,i=='PDF',fTMore)}//, mouseover: function(ev){ev.stopPropagation()}, mouseout: function(ev){ev.stopPropagation()}
								,apT: siteList
							});}
						siteList.style.height ='auto'; siteList.style.textAlign ='center'; siteList.style.marginRight ='-40px';
					}
				}
			}
		});

	}, el: d.body})}catch(er){console.log('==cB');cB()}
	var saveLocStor = function(ev, val, do2){ var aaa,aab,aac,aad,aae,aaf, t = ev && ev.target.form || document.documentElement || document.body;
		xLocStor({do: do2 ||'set', key:'sett'
			, val:{lang: (aaa=d.querySelectorAll('.lang', t))[aaa.length-1].value
				,sites: ((aab=d.querySelectorAll('.sites', t))[aab.length-1].value||'').replace(/^[ \t]*|[ \n\t]*$/g,'')
					.split('\n')
				,lastHoursLess: (aac=d.querySelectorAll('.less', t))[aac.length-1].checked
				,design1612: (aad=d.querySelectorAll('.des16', t))[aad.length-1].checked
				,whiteMintOval: (aae=d.querySelectorAll('.des18', t))[aae.length-1].checked
				,hiddenEdgeLeft: !(aaf=d.querySelectorAll('.butTyp', t))[aaf.length-1].checked
				,dwmyh: S.dwmyh || setts.dwmyh
			}
			,cB: function(prev){
				console.info('Settings are saved. prev=', prev);}
		});
		$q('.siteList .settIn').classList.add('changed');
	};

})({ //write "lang:''," to remove hints; 'en' for English hints (fr - Français, es - espagnol), 'ru' for Russian
	lang:''|| (navigator.languages && navigator.languages[1] || navigator.language.substr(0,2)) //='' if hide hints, or 2 letters from $l{}
	,sites: [ //=array or one site in string
		'','slashdot.org','reddit.com','techcrunch.com','habr.com','geektimes.com'
		,'smashingmagazine.com','engadget.com'] //write your favorite sites
	,lastHoursLess: 1 //=boolean - not show odd some values of hours after 8 h
	,design1612: 0 //=boolean - gray design is disabled for layout1811 ===== TODO enable
	,whiteMintOval: 1 //=boolean - white-mint-oval design with sticked search field
	,hiddenEdgeLeft: 0 //how many extra buttons to hide from left
	,dwmyh: [1,1,1,1,1] //=array of numbers - current vals of days, weeks, months, years, hours
	,fileType:{} // turn on or off {doc:1, txt:1}
	,meta:{} // on/off {Ask:1, }
		//TODO meta-data for search of same results {Ya:{title:'',txt:'',url:''},...}
	,imgFile:'' // one of: switch to img search or in img search
	,imgType:{} //{itp:'face'}
	,imgColor:{} //{isc:'blue'}
	,imgSize:{} //{isz:'i'}
	,imgSizeLt:{} //{islt:'vga'}
});
