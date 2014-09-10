var alreadyCalled = false;

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
