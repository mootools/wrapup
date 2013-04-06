(function(){
    var modules = {}, cache = {}
    if (typeof define == 'undefined'){
        window.define = function(id, factory){
            modules[id] = factory
        }
        window.require = function(id){
            var module = cache[id]
            if (!module){
                module = cache[id] = {}
                var exports = module.exports = {}
                modules[id].call(exports, require, exports, module)
            }
            return module.exports
        }
    }
})()
