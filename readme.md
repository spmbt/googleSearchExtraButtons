### Google Search Extra Buttons

[(show this instruction **in Russian**)](readmeRu.md)

Add buttons to results search page of Google.<br>
*(Fx, Chrome, Opera, Safari)*

Hosting: [greasyfork.org: Google Search Extra Buttons](https://greasyfork.org/en/scripts/7543-google-search-extra-buttons)

* Fx - script installed by Scriptish/GreaseMonkey (addons for userscripts);
* Chrome - immediately (on the page chrome://extensions/ it placed as unpacked script in "developer mode"; directory sholuld be contain manifest.json; or by other methods);
* Opera - создаётся юзерскрипт в файле, помещается в папку... ( инструкция );
* Safari - installed by NinjaKit (not checked, but no complexity in script).

Script adds 5 buttons that doubled links hidden in:

* search PDF docs;
* search for last month day;
* search for last week;
* search for last month;
* search for last year;
* if uncomment string "S" in code with your wished domain name, will present button of search by site;
* in last string: ('ru'); //remove for no hints; write 'en' for English hints;
* write list of your favorite sites in code (example: ['slashdot.org','digg.com']), and it give to show button "site".

This script is based on [BarsMonster article (ru)](http://habrahabr.ru/post/179367/) .

Screenshot:

![Search with extra buttons](https://greasyfork.org/system/screenshots/screenshots/000/000/015/original/googleSearchExtraButtons-20150118-031446.png?14215417344)
