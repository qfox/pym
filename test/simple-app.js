var ASSERT = require('assert');
var domain = require('domain');
var util = require('util');

var App = require('..');

describe('Basic tests', function () {

    it('Mono app should load package relative to main file', function (done) {
        var app = App.create();
        app.usePackage('../../../test/fixtures/modules/some-config');
        app.require(['config'], function (config) {
            ASSERT.equal(config.title, 'I\'m a config module. Trust me!');
            ASSERT.equal(config.options, '{}');
            done();
        }, done);
    });

    it('App with uses should preload package', function (done) {
        var app = App.create({
            path: './test/fixtures/simple-app',
            uses: ['some-config']
        });
        app.require(['config'], function (config) {
            ASSERT.equal(config.title, 'I\'m a config module. Trust me!');
            ASSERT.equal(config.options, '{}');
            done();
        }, done);
    });

    it('App with uses should preload package with config', function (done) {
        var app = App.create({
            path: './test/fixtures/simple-app',
            uses: {'some-config': {yolo: 'swag'}}
        });
        app.require(['config'], function (config) {
            ASSERT.equal(config.options, '{"yolo":"swag"}');
            done();
        }, done);
    });

    it('App with uses should throw if not array or object', function () {
        ASSERT.throws(function () {
            App.create({
                path: './test/fixtures/simple-app',
                uses: 'foo-bar'
            });
        });
    });

    it('Provide could resolve in an error', function (done) {
        var d = domain.create();
        d.on('error', function () { done(); });
        d.run(function () {
            var app = App.create();
            app.define('module', function (provide) {
                provide(null, new Error('Oops!'));
            });
            app.require('module', function (module) {
                console.log('Should not be executed but resolves in ' + module);
            });
        });
    });

    it('should throw if architect plugin is with wrong api', function () {
        ASSERT.throws(function () {
            var app = App.create();
            app.usePackage('./unknown/');
        },
        /Can\'t find "/);
    });

    it('should throw if module name or path is wrong', function () {
        ASSERT.throws(function () {
            var app = App.create();
            app.usePackage('./unknown/');
        },
        /Can\'t find "/);
    });

    it('should throw if module is with unknown format', function () {
        ASSERT.throws(function () {
            var app = App.create();
            app.usePackage('./');
        },
        /Unsupported package/);
    });

    it('should throw if architect register calls with an error', function (done) {
        shouldThrow(function () {
            var app = App.create();
            app.usePackage('../../../test/fixtures/modules/architect-invalid-plugin', {throwError: true});
            app.require('invalid', function () {});
        },
        /Invalid acrhitect plugin format/, done);
    });

    it('should throw if architect register calls with non-object value', function (done) {
        shouldThrow(function () {
            var app = App.create();
            app.usePackage('../../../test/fixtures/modules/architect-invalid-plugin', {returnInvalidString: true});
            app.require('invalid', function () {});
        },
        /Invalid acrhitect plugin format/, done);
    });

    it('should throw if architect register called multiple times', function (done) {
        shouldThrow(function () {
            var app = App.create();
            app.usePackage('../../../test/fixtures/modules/architect-invalid-plugin', {multipleTimes: true});
            app.require('invalid', function () {});
        },
        /Service overloading not supported/, done);
    });

    it('should throw if architect register does not call', function (done) {
        shouldThrow(function () {
            var app = App.create();
            app.usePackage('../../../test/fixtures/modules/architect-invalid-plugin', {empty: true});
            app.require('invalid', function () {});
        },
        /Invalid architect plugin found on service/, done);
    });

    /**
     * Helper for wrapping throws into domain events
     * @param {Function} code
     * @param {RegExp} [errRe]
     * @param {Function} done
     */
    function shouldThrow(code, errRe, done) {
        if (arguments.length === 2) {
            done = errRe;
            errRe = null;
        }

        ASSERT(typeof code === 'function', 'Expect code callback as first argument');
        ASSERT(typeof done === 'function', 'Expect done callback as last argument');

        var d = domain.create();
        d.on('error', function (err) {
            if (!errRe || errRe.test(err)) {
                done();
            } else {
                done(err);
            }
        });
        d.run(code);
    }
});

describe('Simple inherited app', function () {

    var app;
    var conf;
    beforeEach(function () {
        app = createSimpleApp();
        conf = {yolo: 'swag'};
    });

    it('should contains meta about packages (?)'); // or don't?

    it('should use pym plugins', function (done) {
        app.usePackage('some-config', conf);
        app.require(['config'], function (config) {
            ASSERT.equal(config.title, 'I\'m a config module. Trust me!');
            ASSERT.equal(config.options, JSON.stringify(conf));
            done();
        }, done);
    });

    it('should use architect plugins', function (done) {
        app.usePackage('architect-plugin', conf);
        app.require(['service'], function (service) {
            ASSERT.equal(service.title, 'I\'m a config module. Trust me!');
            ASSERT.equal(service.options, JSON.stringify(conf));
            ASSERT.equal(service.imports, JSON.stringify({}));
            done();
        }, done);
    });

    it('should execute setup once in architect plugins', function (done) {
        app.usePackage('architect-multiple-registers');
        app.require(['aa', 'bb', 'cc'], function (aa, bb, cc) {
            ASSERT.equal(aa, 'aa');
            ASSERT.equal(bb, 'bb');
            ASSERT.equal(cc, 'cc');
            done();
        }, done);
    });

    it('should load commonjs as services (?)');

    it('should resolve multiple services as modules correctly', function (done) {
        app.define('d', ['a', 'b', 'c'], function (provide, a, b, c) {
            ASSERT.equal(a, 'a');
            ASSERT.equal(b, 'b');
            ASSERT.equal(c, 'c');
            provide('d');
        });
        app.usePackage('modules-abc');
        app.require(['d'], function (d) {
            ASSERT.equal(d, 'd');
            done();
        }, done);
    });

    it('should correctly mix different interfaces', function (done) {
        app.usePackage('architect-imports-abc');
        app.usePackage('modules-abc');
        app.require(['a', 'b', 'c', 'imports-abc'], function (a, b, c, importsAbc) {
            ASSERT(importsAbc.imports);
            ASSERT.equal(importsAbc.imports.a, a);
            ASSERT.equal(importsAbc.imports.b, b);
            ASSERT.equal(importsAbc.imports.c, c);
            done();
        }, done);
    });

    /**
     * Simple app fixture
     */
    function simpleApp(opts) {
        App.call(this, opts);
    }

    util.inherits(simpleApp, App);

    /**
     * Creates app instance
     */
    function createSimpleApp() {
        return new simpleApp({path: './test/fixtures/simple-app'});
    }
});
