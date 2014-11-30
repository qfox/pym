/**
 * Example of invalid architect api plugin
 * @param {Object} options
 * @param {Object} imports
 * @param {function(Error, Object)} register
 */
module.exports = function (options, imports, register) {
    if (options.throwError) {
        register(new Error('invalid plugin error'));
    } else if (options.returnInvalidString) {
        register(null, 'invalid');
    } else if (options.multipleTimes) {
        register(null, {
            config: '1'
        });
        register(null, {
            config: '2'
        });
    }
};
