"use strict";

var prime = require('prime')
var forOwn = require('prime/object/forOwn')
var Relative = require('./_relative')

var ASCII = prime({

    inherits: require('./output'),

    relativeModules: Relative.prototype.relativeModules,

    up: function(callback){
        var modules = this.relativeModules()
        var str = ''
        forOwn(modules, function(mod, name){
            str += name
            if (mod.namespace) str += ' (' + mod.namespace + ')'
            str += '\n'
            var len = mod.deps.length
            mod.deps.forEach(function(dep, i){
                str += (i + 1 == len ? '└─' : '├─') + dep + '\n'
            })
        })
        callback(null, str)
    }

})

module.exports = ASCII
