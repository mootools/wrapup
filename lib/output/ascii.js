"use strict";

var prime = require('prime')
var forOwn = require('prime/object/forOwn')
var relative = require('../util').relative

var ASCII = prime({

    inherits: require('./output'),

    relativeModules: function(){
        var modules = {}
        var storage = this.storage
        storage.each(function(module, fullpath){
            if (module.err) return
            modules[relative(fullpath)] = {
                deps: module.deps.filter(function(dep){
                        return !!dep
                    }).map(function(dep){
                        return relative(dep.full)
                    }),
                namespace: module.namespace
            }
        })
        return modules
    },

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
