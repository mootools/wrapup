"use strict";

var prime = require('prime')
var relative = require('../../util').relative

var Relatives = prime({

    relativeModules: function(){
        var modules = {}
        var path = process.cwd() + '/a'
        this.storage.each(function(module, fullpath){
            if (module.err) return
            modules[module.getModuleID(path)] = {
                deps: module.getRelativeDeps(path),
                namespace: module.namespace
            }
        })
        return modules
    }

})

module.exports = Relatives
