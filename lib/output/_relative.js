"use strict";

var prime = require('prime')
var relative = require('../util').relative

var Relatives = prime({

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
    }

})

module.exports = Relatives
