var ASSERT = require('assert');
var util = require('util');

var App = require('..');

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
