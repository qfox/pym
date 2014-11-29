/**
 * Example of architect api plugin
 * @param {Object} options
 * @param {Object} imports
 * @param {function(Error, Object)} register
 */
module.exports = function (options, imports, register) {
    register(null, {
        'imports-abc': {
            title: 'abc',
            imports: imports
        }
    });
};
