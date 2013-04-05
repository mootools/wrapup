define('output/up', function(require, module, exports, global) {
    require("output/e")
    var a = require("output/up1").name
    var b = new (require("output/up1"))()
    var c = new require("output/up1")
    var d = {a: require("output/up1")}
    var e = require("output/e") + require("output/e")
    module.exports = require("output/up1")()
});

define('output/e', function(require, module, exports, global) {
    module.exports = 'e'
});

define('output/up1', function(require, module, exports, global) {
    module.exports = function() {
        console.log("up1")
    }
});
