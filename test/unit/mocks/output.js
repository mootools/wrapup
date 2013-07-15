"use strict";

var prime = require('prime')

var Mock = prime({

    inherits: require('../../../lib/output/output'),

    up: function(callback){
        callback()
    },

    getModules: function(){
        return this.storage.keys()
    },

    getModule: function(mod){
        return this.storage.get(mod)
    }

})

module.exports = Mock
