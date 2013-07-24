"use strict";

var prime = require('prime')
var Emitter = require('prime/emitter')
var util = require('../util')

var Output = prime({

    inherits: Emitter,

    constructor: function(storage){
        this.withStorage(storage)
        this.options = {}
    },

    withStorage: function(storage){
        this.storage = storage
        return this
    },

    set: function(option, value){
        this.options[option] = value
        return this
    },

    get: function(option){
        return this.options[option]
    },

    up: function(callback){
        throw new Error("overwrite this method")
    }

})

exports = module.exports = Output

function getUID(dep){
    return dep.uid
}

// replace "require('...')" with the module id or replace the entire require()
// with null if the required module doesn't exist.
exports.replaceRequire = function(ast, module, getProperty){
    if (!getProperty) getProperty = getUID
    for (var r = 0; r < module.requires.length; r++){
        var req = module.requires[r], dep = module.dependencies[r], reqAST
        if (dep){
            reqAST = util.getFromPath(ast, req.path)
            reqAST['arguments'][0].value = getProperty(dep)
        } else {
            var parts = req.path.split('.')
            var key = parts.pop()
            reqAST = util.getFromPath(ast, parts)
            reqAST[key] = {type: "Literal", value: null}
        }
    }
}
