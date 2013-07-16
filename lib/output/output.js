"use strict";

var prime = require('prime')
var util = require('../util')

var Output = prime({

    constructor: function(storage){
        this.withStorage(storage)
        this.options = {}
    },

    withStorage: function(storage){
        this.storage = storage
        return this
    },

    setOptions: function(options){
        this.options = options
    },

    up: function(callback){
        throw new Error("overwrite this method")
    }

})

exports = module.exports = Output


// replace "require('...')" with the module id or replace the entire require()
// with null if the required module doesn't exist.
exports.replaceRequire = function(ast, module, property){
    for (var r = 0; r < module.requires.length; r++){
        var req = module.requires[r], dep = module.deps[r], reqAST
        if (dep){
            reqAST = util.getFromPath(ast, req.path)
            reqAST['arguments'][0].value = dep[property || 'uid']
        } else {
            var parts = req.path.split('.')
            var key = parts.pop()
            reqAST = util.getFromPath(ast, parts)
            reqAST[key] = {type: "Literal", value: null}
        }
    }
}

