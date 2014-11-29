/**
 * Example of architect api plugin
 * @param {Object} options
 * @param {Object} imports
 * @param {function(Error, Object)} register
 */
module.exports = function (options, imports, register) {
    register(null, {
        service: {
            title: 'I\'m a config module. Trust me!',
            imports: JSON.stringify(imports),
            options: JSON.stringify(options)
        }
    });
};
