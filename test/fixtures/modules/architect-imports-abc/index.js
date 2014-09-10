module.exports = function (options, imports, register) {
    register(null, {
        'imports-abc': {
            title: 'abc',
            imports: imports
        }
    });
};
