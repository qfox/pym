# pym

[![Build Status](https://secure.travis-ci.org/zxqfox/pym.svg?branch=master)](https://travis-ci.org/zxqfox/pym)
[![NPM version](https://badge.fury.io/js/pym.png)](http://badge.fury.io/js/pym)
[![Dependency Status](https://david-dm.org/zxqfox/pym.png)](https://david-dm.org/zxqfox/pym)

Packaged YM-modules

## Что это и зачем?

Это CommonJS модуль-помощник для создания приложений на базе подключаемых модулей.

Предоставляет API для подключения плагинов (npm-пакетов).
Поддерживает асинхронные `define`, `require`, `provide` (подробнее в `ym`).

Сделано для упрощения построения приложений из кусочков (npm-пакетов), сделанных в виде плагинов.

Почему не `CommonJS`? Потому что `ym` более элегантен.

## API

Пакет предоставляет класс `App`, от которого можно наследовать класс вашего приложения; а так же статический метод `create`.

### App

```js
var pym = require('pym');
var util = require('util');

util.inherits(myApp, pym);
function myApp(opts) {
  pym.call(this, opts);
  // your custom application
}

var app = new myApp();
```

### App.create

```js
var app = require('pym').create({ /* опции */ });
```

### App.prototype.define - объявление модуля

  - {string} moduleName
  - {string[]} [dependencies]
  - {function(function(objectToProvide, [error]), ...[resolvedDependency], [previousDeclaration])} declarationFunction

см. [ym.prototype.define](https://github.com/ymaps/modules/#module-declaration)

### App.prototype.require - использование модуля

  - {string[]} dependencies
  - {function(...[resolvedDependency])} successCallbackFunction
  - {function(error: Error)} [errorCallbackFunction]

см. [ym.prototype.require](https://github.com/ymaps/modules/#module-usage)

### App.prototype.usePackage - загрузка пакета модулей

На вход метод принимает:

  - {String} package — название npm-пакета или директории
  - {Object} options — пачку опций, которые будут перенаправлены в модуль

```js
var app = require('pym').create({ /* опции */ });
app.usePackage('some-npm-package');
app.require('module', function (module) {
  // your app
  module.doSomething();
});
```

## Сравнение с Architect

`pym` имеет враппер для загрузки модулей на базе [Architect plugin interface](https://github.com/c9/architect/#plugin-interface).
Это значит, что вы можете загружать ваши пакеты (плагины) для `Architect` используя `pym`. Сервисы (в терминах `Architect`) будут предоставлены как `ym`-модули.

Отличия от `Architect`:
  - нет метода `loadConfig` — нет смысла фиксировать формат конфига, когда можно отдать его на откуп разработчикам;
  - есть асинхронный provide в runtime;
  - интерфейс пакетов вынуждает явно заявлять, какие модули он требует.

## Благодарности

- Создано на базе [ymaps/modules](https://github.com/ymaps/modules)
- Спасибо за идею [c9/architect](https://github.com/c9/architect)

## Лицензия

[MIT](http://github.com/zxqfox/pym/blob/master/LICENSE)
