### Google Search Extra Buttons

Добавление кнопок вариантов поиска на страницу результатов поиска Гугла.

(Fx, Chrome, Opera12, Safari)
Хостинг: [greasyfork.org](https://greasyfork.org/en/scripts/7543-google-search-extra-buttons)

* Fx - ставится с помощью Scriptish/GreaseMonkey (аддоны для скриптов);
* Chrome - непосредственно, без расширений (на странице chrome://extensions/ ставится как распакованный скрипт в "режиме разработчика"; в папке должен быть manifest.json; или другими способами);
* Opera - создаётся юзерскрипт в файле, помещается в папку... ( инструкция );
* Safari - ставится с помощью NinjaKit (не проверялось, но ничего особого в скрипте нет).

Добавляет 8 типов кнопок рядом с кнопкой поиска (некоторые типы имеют подсписки кнопок):

* искать документы PDF;
* поиск по сайту (из списка сайтов; если список в настройках скрипта не задан, кнопка не показывается);
* впишите в код скрипта список ваших сайтов для поиска (например, ['slashdot.org','digg.com']);
* поиск на интервале дат (вызов Гугл-интерфейса в 1 клик);
* искать за последние 1,2..13 дней;
* искать за последние 1,2..10 недель;
* искать за последние 1,2..11 месяцев;
* искать за последние 1,2..10 лет;
* искать за последние 1,2..22 часа;
* многоязычный интерфейс по настройкам или navigator.language ('en' - по умолчанию или для непредусмотренного языка);
* удалите 'lang' в настройках, чтобы подсказки не появлялись (интерфейс будет английским).

Основано на [статье BarsMonster](http://habrahabr.ru/post/179367/) .


![Для поиска по сайту](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/googleSearchExtraButt20150218-white.png)

![Список для поиска по сайту в тёмном дизайне заголовка](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/googleSearchExtraButt20150218-dark.png)

![Версия 9 сент. 2015: больше кнопок](https://raw.githubusercontent.com/spmbt/googleSearchExtraButtons/master/20150909-googleSearchExtra123week.png)