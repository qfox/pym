module.exports = function (ym) {
    ym.define('a', function (provide) {
        provide('a');
    });
    ym.define('b', function (provide) {
        provide('b');
    });
    ym.define('c', function (provide) {
        provide('c');
    });
};
