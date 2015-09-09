### Google Search Extra Buttons

[(show this instruction **in Russian**)](readmeRu.md)

Add buttons of customized search to results page of Google.<br>
*(Fx, Chrome, Opera12, Safari)*

Hosting: [greasyfork.org: Google Search Extra Buttons](https://greasyfork.org/en/scripts/7543-google-search-extra-buttons)

* Fx - script installed by Scriptish/GreaseMonkey (addons for userscripts);
* Chrome - immediately (on the page chrome://extensions/ it placed as unpacked script in "developer mode"; directory sholuld be contain manifest.json; or by other methods);
* Opera 12- - save userscript in file placed in Opera directory... ( there are instructions );
* Safari - installed by NinjaKit (not checked, but no complexity in script).

Script adds 11 buttons that doubled links hidden in:

* search PDF docs;
* search in interval of dates (fast opening of Google inteface);
* search for 1/2/3 last days;
* search for 1/2/3 last weeks;
* search for last month;
* search for last year;
* if uncomment line beginning "site:" in code, it will present button of search by some site or list of sites;
* in last string: ('ru'); //remove for no hints; write 'en' for English hints;
* write list of your favorite sites in code (example: ['slashdot.org','digg.com']), and it give to show button "site".

This script is based on [BarsMonster article (ru)](http://habrahabr.ru/post/179367/) .

Screenshots:

![Search with extra buttons](https://greasyfork.org/system/screenshots/screenshots/000/000/015/original/googleSearchExtraButtons-20150118-031446.png?14215417344)

![List for search in sites (old version with 6 buttons)](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/googleSearchExtraButt20150218-white.png)

![List for search in sites in dark header style of page](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/googleSearchExtraButt20150218-dark.png)

![Version from 9/9/2015: more buttons](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/20150909-googleSearchExtra123week.png)