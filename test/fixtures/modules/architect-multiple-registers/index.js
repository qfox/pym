var alreadyCalled = false;

/**
 * Example of architect api plugin
 * @param {Object} options
 * @param {Object} imports
 * @param {function(Error, Object)} register
 */
module.exports = function (options, imports, register) {
	if (alreadyCalled) {
		throw new Error('Redundant setup call for architect plugin');
	}

    register(null, {
        aa: 'aa',
        bb: 'bb'
    });
    register(null, {
        cc: 'cc'
    });

    alreadyCalled = true;
};
