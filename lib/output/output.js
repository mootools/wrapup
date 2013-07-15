"use strict";

var prime = require('prime')

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

module.exports = Output
