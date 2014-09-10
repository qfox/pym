# pym

[![Build Status](https://secure.travis-ci.org/zxqfox/pym.svg?branch=master)](https://travis-ci.org/zxqfox/pym)
[![NPM version](https://badge.fury.io/js/pym.png)](http://badge.fury.io/js/pym)
[![Dependency Status](https://david-dm.org/zxqfox/pym.png)](https://david-dm.org/zxqfox/pym)

Packaged YM-modules

## What is it?

It's a CommonJS module-assistant for creating plugin-based apps.

Provides API for loading packages (plugins as npm-modules).

Supports asynchronous `define`, `require`, `provide` (inherited from `ym`).

Made for simplifying plugin-based apps building.

Why it's not based on `CommonJS`? Because `ym` is more elegant.

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
var app = require('pym').create({ /* options */ });
```

### App.prototype.define - module definition

  - {string} moduleName
  - {string[]} [dependencies]
  - {function(function(objectToProvide, [error]), ...[resolvedDependency], [previousDeclaration])} declarationFunction

see [ym.prototype.define](https://github.com/ymaps/modules/#module-declaration)

### App.prototype.require - module usage

  - {string[]} dependencies
  - {function(...[resolvedDependency])} successCallbackFunction
  - {function(error: Error)} [errorCallbackFunction]

see [ym.prototype.require](https://github.com/ymaps/modules/#module-usage)

### App.prototype.usePackage - package loading

Waits for:

  - {String} package — npm-package name or path to package
  - {Object} options — some package options

```js
var app = require('pym').create({ /* options */ });
app.usePackage('some-npm-package');
app.require('module', function (module) {
  // your app
  module.doSomething();
});
```

## Relation to Architect

`pym` has a wrapper to load modules built with [Architect plugin interface](https://github.com/c9/architect/#plugin-interface).
It means you can easily use packages (plugins) made for `Architect` platform in `pym` infrastructure. `Architect` services will be resolved as `ym`-modules.

Differences from `Architect`:
  - it hasn't `loadConfig` method — and no frozen config format, use any config you like;
  - it supports asynchronous provide in runtime;
  - packages interface is more explicit.

## Thanks

  - Built with [ymaps/modules](https://github.com/ymaps/modules)
  - Inspired by [c9/architect](https://github.com/c9/architect)

## License

[MIT](http://github.com/zxqfox/pym/blob/master/LICENSE)
