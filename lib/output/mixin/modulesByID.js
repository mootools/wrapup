"use strict";

var path   = require('path')
var prime  = require('prime')
var util   = require('../../util')
var errors = require('../../errors')

var uid = 0;

module.exports = prime({

    modulesByID: function(){
        var byID = {}
        this.storage.each(function(module, full){
            byID[module.uid] = module
        })
        return byID
    }

})
