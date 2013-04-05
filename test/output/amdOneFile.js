define('up', function(require, module, exports, global) {
    require("./e")
    var a = require("./up1").name
    var b = new (require("./up1"))()
    var c = new require("./up1")
    var d = {a: require("./up1")}
    var e = require("./e") + require("./e")
    module.exports = require("./up1")()
});

define('e', function(require, module, exports, global) {
    module.exports = 'e'
});

define('up1', function(require, module, exports, global) {
    module.exports = function() {
        console.log("up1")
    }
});
