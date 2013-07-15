"use strict";

var prime = require('prime')

var Output = prime({

    constructor: function(storage){
        this.withStorage(storage)
    },

    withStorage: function(storage){
        this.storage = storage
        return this
    }

})

module.exports = Output
