var EventEmitter = require('events').EventEmitter;
var UTIL = require('util');
var FS = require('fs');
var PATH = require('path');

var YM = require('ym');
var U = require('./util');

UTIL.inherits(App, EventEmitter);

/**
 * App
 */
function App() {
    EventEmitter.call(this);
}

/**
 * @param {String} appPath
 */
function createApp(appPath) {
    var modulesPath = PATH.join(appPath, 'node_modules');
    var modulesCache;

    var app = new App();

    /**
     * @param {Object} packageData package.json data
     * @returns {Object} configuration
     */
    function readPluginConfig(packageData) {
        var r = packageData.plugin || {};
        r.module = r.module || packageData.main || 'index.js';
        r.provides = r.provides || [];
        r.consumes = r.consumes || [];
        return r;
    }

    /**
     * looking for requireable modules list for some path
     * @param {function} cb - Callback to resolve result or error
     */
    function resolveModules(cb) {

        if (modulesCache) {
            return cb(null, modulesCache);
        }

        // reading modules
        FS.readdir(modulesPath, function (err, files) {
            if (err) {
                return cb(err);
            }

            U.readFiles(
                files.map(function (v) {
                    return PATH.join(modulesPath, v, 'package.json');
                }),
                function (dummy, filesData) {
                    // we don't care if there is no package.json in directory so we don't need to check first arg
                    var result = [];

                    result.index = Object.create(null);

                    filesData.forEach(function (data, k) {
                        if (!data) {
                            // skip failed keys
                            return;
                        }

                        var name = files[k];

                        result.index[name] = -1 + result.push({
                            name: name, package: JSON.parse(data)
                        });
                    });

                    cb(err, modulesCache = result);
                });

        });

    }

    /**
     * loads app modules meta data
     * @param {array} modules - list of module names
     * @param {function} cb
     */
    function readMeta(modules, cb) {

        resolveModules(function (err, modulesList) {
            if (err) {
                return cb(err);
            }

            var res = modules.reduce(function (res, name, k, v) {
                k = modulesList.index[name];

                if (!k) {
                    return res;
                }

                res[name] = v = modulesList[k];
                v.plugin = v.package ? readPluginConfig(v.package) : undefined;
                return res;
            }, {});

            // returns list of resolved modules with meta
            cb(null, res);
        });

    }

    /**
     * loads app modules
     * @param {String|String[]} modules - list of module names
     * @param {Function} cb
     */
    function use(modules, cb) {

        // normalize
        modules = Array.isArray(modules) ? modules : [modules];

        console.log(process);
        // modules.push('bem');

        readMeta(modules, function (err, meta) {
            if (err) {
                return app.emit('error', err);
            }

            // dummy

            // app.emit('ready', meta);
        });

        return app;
    }

    app.readMeta = readMeta;
    app.use = use;

    return app;
}

/**
 * @param {String} path - Base path to looking for node_modules
 */
function pym(path) {
    return createApp(path);
}

module.exports = pym;
