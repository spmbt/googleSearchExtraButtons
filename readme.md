### Google Search Extra Buttons

[(show this instruction **in Russian**)](readmeRu.md)

Add buttons of customized search to start page and results page of Google.<br>
*(Fx, Chrome, Opera12+, Safari, [MS Edge + Win10 + Tampermonkey](https://greasyfork.org/ru/forum/discussion/6048/x))*, Vivaldi, KMeleon, Yandex, Brave

NOTE 2022-08: 1) for working in Images tab in Chrome it need install extension whiсh disable CSP (Content Security Policy) else breaks by JS error. (It's not required for common search.)<br>
NOTE: 2) G. Search in images restrict past intervals! Only day|week|month|year.<br>
      3) WxH (show sizes) function is removed, so button is changed to B/W.

2022-08-22: Google Dark Theme support (in input field);<br>
2018-12-11: White-Mint-Oval design (as default), blue old design as additional;<br>
2018-12-05..11: start page with buttons is repaired; fix img search; hide buttons in shop|boks|finance;<br>
2018-11-30..12-4: search by up to 30 filetypes; images search by types and Show Sizes checkbox;<br>
2018-11-19: by changes of layout (classes and logic) of results page (TODO start page, 'pdf+enter+next' bug); _(when search with filetype:pdf then search by Enter key without pdf (appears 'filetype:pdf'))_<br>
2017-12-12: transitions in fading columns; some style modifications.<br>
2017-03-11: change constructor Tout() to short function SC() (decelerating timeout - refactoring).<br>
2016-12-12: gray design of buttons on the pages with new desing of Google.
2016-12-07: fixes for compatibility of new design of input fields; old format is supported also.<br>
2016-01-17: fix autostart after select of site; switch of checkbox.

Hosting: [greasyfork.org: Google Search Extra Buttons](https://greasyfork.org/en/scripts/7543-google-search-extra-buttons)

* Fx - script installed by GreaseMonkey or Tampermonkey (addons for userscripts);
* Chrome - immediately (on the page chrome://extensions/ it placed as unpacked script in "developer mode"; directory sholuld be contain manifest.json; or by other methods (Tampermonkey));
* Opera - save userscript in file placed in Opera directory... ( there are instructions );
* Safari - installed by Tampermonkey for Safari.

Script adds 8 types of buttons that doubled links hidden in:

* change interface language (en(default), fr, ru, de, es) in Settings area;
* search PDF, DOC docs;
* search in site (from list; if no list in settings (or commented in code), this button is not displayed);
* write list of your favorite sites in code (example: ['slashdot.org','digg.com']);
* search in interval of dates (fast opening of Google inteface);
* search for 1,2..13 last days;
* search for 1,2..10 last weeks;
* search for 1,2..11 last months;
* search for 1,2..10 last years;
* search for 1,2..22 last hours;
* multilanguage interface by settings in navigator.language or in script: ('en' is default or on undescribed language);
* remove lang in settings for no hints (interface language will be English).
* save settings (language and sites list) in the external localStorage (google clean own storage), copy list as text.
* keep type of current page ('tbm=' parameter) - news, pictures, video etc.

This script is based on [BarsMonster article (ru)](http://habrahabr.ru/post/179367/) .

Screenshots:

![Search with extra buttons](https://greasyfork.org/system/screenshots/screenshots/000/000/015/original/googleSearchExtraButtons-20150118-031446.png?14215417344)

![List for search in sites (old version with 6 buttons)](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/googleSearchExtraButt20150218-white.png)

![List for search in sites in dark header style of page](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/googleSearchExtraButt20150218-dark.png)

![Version from 9/9/2015: more buttons](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/20150909-googleSearchExtra123week.png)

**Version from 12/12/2016: new design of Google search page and new design of exta buttons:**

![Version from 12/12/2016: new design of Google search](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/2016-12-12_searchNewDesign3.png)

![Version from 12/12/2016: new 3rd design - main page](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/2016-12-12_searchStartNewDes3.png)