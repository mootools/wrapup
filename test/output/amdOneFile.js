define('test/fixtures/up', function(require, exports, module) {
    require("test/fixtures/e")
    var a = require("test/fixtures/up1").name
    var b = new (require("test/fixtures/up1"))()
    var c = new require("test/fixtures/up1")
    var d = {a: require("test/fixtures/up1")}
    var e = require("test/fixtures/e") + require("test/fixtures/e")
    module.exports = require("test/fixtures/up1")()
});

define('test/fixtures/e', function(require, exports, module) {
    module.exports = 'e'
});

define('test/fixtures/up1', function(require, exports, module) {
    module.exports = function() {
        console.log("up1")
    }
});
