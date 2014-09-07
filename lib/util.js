
'use strict';

var FS = require('fs');

/**
 * Callback for multiple
 * @callback fsMultipleCallback
 * @param {number} responseCode
 * @param {string} responseMessage
 */

module.exports = {

    /**
     * Abstract helper to asyncly read a bulk of files
     * Note that `cb` will receive an array of errors for each file as an array of files data
     * Keys in resulting arrays will be the same as in `paths`
     *
     * @param {Array} paths - file paths array
     * @param {Function} cb
     *   @param {Array} errors - a list of file reading error
     *   @param {Array} data - a list of file content data
     */
    readFiles: function readFiles(paths, cb) {
        var results = [];
        var errors = [];
        var l = paths.length;

        paths.forEach(function (path, k) {

            FS.readFile(path, function (err, data) {
                // decrease waiting files
                --l;
                // just skip non-npm packages and decrease valid files count
                err && (errors[k] = err);
                !err && (results[k] = data);
                // invoke cb if all read
                !l && cb (errors.length ? errors : null, results);
            });

        });
    }

};
