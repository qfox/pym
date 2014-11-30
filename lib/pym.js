// node
var YM = require('ym');
var FS = require('fs');
var PATH = require('path');

module.exports = App;

/**
 * Creates app
 * @see App
 */
App.create = function create(opts) {
    return new App(opts);
};

/**
 * App constructor
 * @class App
 * @param {Object} opts
 *   @param {string} opts.path
 */
function App(opts) {
    opts = opts || {};

    var path = opts.path || PATH.dirname(require.main.filename);

    // provides ym define&require interface
    var ym = YM.create();

    /**
     * @api
     * @param {string} moduleName
     * @param {string[]} [dependencies]
     * @param {function(function(objectToProvide, [error]), ...[resolvedDependency],
     *   [previousDeclaration])} declarationFunction
     */
    this.define = ym.define;

    /**
     * @api
     * @param {string[]} dependencies
     * @param {function(...[resolvedDependency])} successCallbackFunction
     * @param {function(Error)} [errorCallbackFunction]
     */
    this.require = ym.require;

    /**
     * Loads node package with module provisions
     * @api
     * @param {(string|string[]|Object|Function)} package - package name, or list of,
     *   or package object, or package function
     * @returns {PYM} this
     */
    this.usePackage = function use(package, options) {
        options = options || {};

        var resolvedPackage = _resolvePackageSync(path, package);
        resolvedPackage.exports(this, options);

        return this;
    };

    // load required modules if passed
    if (opts.uses) {
        opts.uses.forEach(function (plugin) {
            this.use(plugin);
        }, this);
    }
}

/**
 * @private
 * @param {Function} setup
 * @param {Object} metadata
 */
function _wrapToArchitect(setup, metadata) {
    var provides = metadata.provides; // defines
    var consumes = metadata.consumes; // requires
    return function (ym, options) {
        var collection = {loaded: false};

        // define each provided service as ym-module
        provides.forEach(function (service) {
            ym.define(service, consumes, function (provide) {
                // just use result from `collection` if setup already was called
                // fixme: potentially it can try to call setup several on calls between module resolves
                if (collection.loaded) {
                    _provideService(provide, collection, service);
                    return;
                }

                // calculate imports hash
                var imports = _pack(consumes, Array.prototype.slice.call(arguments, 1));

                // call setup just once, and put result in `collection` variable
                setup(options, imports, function (err, result) {
                    updateCollected(err, result);
                });

                // and syncly call provide at the end
                _provideService(provide, collection, service);
            });
        });

        /**
         * update `collection` hash
         * @param {Error} err
         * @param {Object} result
         */
        function updateCollected(err, result) {
            if (typeof result !== 'object') {
                collection.err = collection.err || new Error('Invalid acrhitect plugin format');
                return;
            }

            collection.err = collection.err || err;

            if (!collection.loaded) {
                collection.result = result;
                collection.loaded = true;
                return;
            }

            for (var i in result) {
                if (result.hasOwnProperty(i)) {
                    if (collection.result.hasOwnProperty(i)) {
                        collection.err = collection.err || new Error('Service overloading not supported: ' + i);
                        return;
                    }
                    collection.result[i] = result[i];
                }
            }
        }
    };

    /**
     * @private
     * @param {Function} provide - `ym` `provide` function in define ctx
     * @param {Object} cached - cached result of the last `register` call
     * @param {string} service - required `service` name (module name in `ym`)
     */
    function _provideService(provide, cached, service) {
        if (cached.err) {
            provide(null, cached.err);
        } else if (!cached.result[service]) {
            provide(null, new Error('Invalid architect plugin found on service ' + service));
        } else {
            provide(cached.result[service]);
        }
    }
}

/**
 * @private
 * @param {string[]} keys
 * @param {Array} values
 * @returns {Object}
 * @test [["a","b"],["A","B"]] >>> {"a":"A","b":"B"}
 */
function _pack(keys, values) {
    var obj = {};
    for (var j = 0, l = values.length; j < l; j += 1) {
        obj[keys[j]] = values[j];
    }
    return obj;
}

// thanks c9/architect for code parts below

var dirname = PATH.dirname;

/**
 * Loads a module, getting metadata from either it's package.json
 * or export object.
 * @private
 * @param {string} base
 * @param {string} relativePath
 * @returns {Object}
 *   - {string[]} provides
 *   - {string[]} consumes
 *   - {string} packagePath
 *   - {string}
 */
function _resolvePackageSync(base, relativePath) {
    var packageJsonPath;
    var packagePath;

    // try to fetch node package
    try {
        packageJsonPath = _resolvePackagePathSync(base, PATH.join(relativePath, 'package.json'));
        packagePath = dirname(packageJsonPath);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }

        // try to resolve package itself
        packagePath = _resolvePackagePathSync(base, relativePath);
    }

    // compiling resolved metadata
    var packageJson = packageJsonPath && require(packageJsonPath) || {};
    var metadata = packageJson.pym || {};

    metadata.interface =
        metadata.interface ||
        packageJson.pym ? 'pym' :
        packageJson.plugin ? 'architect' :
        // what 'bout amd?
        'commonjs';

    // load package itself
    var packageMainPath;
    var nodeModule;
    switch (metadata.interface) {
        case 'pym':
            packageMainPath = PATH.join(packagePath, metadata.main || packageJson.main);
            nodeModule = require(packageMainPath);
            metadata.provides = metadata.provides || nodeModule.provides || [];
            metadata.consumes = metadata.consumes || nodeModule.consumes || [];
            metadata.packagePath = packagePath;
            metadata.exports = nodeModule;
            break;
        case 'architect':
            var pluginData = packageJson.plugin || {};
            nodeModule = require(packagePath);
            metadata.provides = pluginData.provides || nodeModule.provides || [];
            metadata.consumes = pluginData.consumes || nodeModule.consumes || [];
            metadata.packagePath = packagePath;
            metadata.exports = _wrapToArchitect(nodeModule, metadata);
            break;
        default:
            throw new Error('Unsupported package format ' + relativePath);
    }

    return metadata;
}

var packagePathCache = {};
var resolve = PATH.resolve;
var existsSync = FS.existsSync || PATH.existsSync;
var realpathSync = FS.realpathSync;

/**
 * Node style package resolving so that plugins' package.json can be found relative to the config file
 * It's not the full node require system algorithm, but it's the 99% case
 * This throws, make sure to wrap in try..catch
 * @private
 * @param {string} base - base path
 * @param {string} relativePath
 */
function _resolvePackagePathSync(base, relativePath) {
    var originalBase = base;
    if (!(base in packagePathCache)) {
        packagePathCache[base] = {};
    }

    var cache = packagePathCache[base];
    if (relativePath in cache) {
        return cache[relativePath];
    }

    var packagePath;
    if (relativePath[0] === '.' || relativePath[0] === '/') {
        packagePath = resolve(base, relativePath);
        if (existsSync(packagePath)) {
            packagePath = realpathSync(packagePath);
            cache[relativePath] = packagePath;
            return packagePath;
        }
    } else {
        var newBase;
        while (base) {
            packagePath = resolve(base, 'node_modules', relativePath);
            if (existsSync(packagePath)) {
                packagePath = realpathSync(packagePath);
                cache[relativePath] = packagePath;
                return packagePath;
            }
            newBase = resolve(base, '..');
            if (base === newBase) {
                break;
            }
            base = newBase;
        }
    }

    var err = new Error('Can\'t find "' + relativePath + '" relative to "' + originalBase + '"');
    err.code = 'ENOENT';
    throw err;
}
