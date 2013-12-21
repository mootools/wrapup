"use strict";

exports.src = function(module, callback){
    module.src = module.src.replace('./e', './h')
    callback(null, module)
}

exports.ast = function(module, callback){
    var ast = module.ast
    var fooFunction = ast.body[0].id
    if (fooFunction) {
        fooFunction.name = 'bar'
    }
    callback(null, module)
}
