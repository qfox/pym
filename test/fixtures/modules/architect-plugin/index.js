module.exports = function (options, imports, register) {
    register(null, {
        service: {
            title: 'I\'m a config module. Trust me!',
            imports: JSON.stringify(imports),
            options: JSON.stringify(options)
        }
    });
};
