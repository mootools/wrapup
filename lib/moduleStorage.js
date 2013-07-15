"use strict";

var prime = require('prime')
var Emitter = require('prime/emitter')
var forOwn = require('prime/object/forOwn')
var filter = require('prime/object/filter')

var Store = prime({

    inherits: Emitter,

    constructor: function(){
        this._storage = []
    },

    put: function(filename, data){
        this._storage[filename] = data
        this.emit('put', filename)
        return this
    },

    get: function(filename){
        return this._storage[filename]
    },

    remove: function(filename){
        delete this._storage[filename]
        this.emit('remove', filename)
        return this
    },

    invalidate: function(filename){
        var module = this._storage[filename]
        if (module){
            module.invalid = true
            this.emit("invalidate", filename)
        }
        return this
    },

    keys: function(){
        return Object.keys(this._storage || {})
    },

    each: function(fn, context){
        forOwn(this._storage, fn, context)
        return this
    },

    getInvalidates: function(){
        return filter(this._storage, function(mod){
            return mod.invalid
        })
    },

    isEmpty: function(){
        for (var i in this._storage) return false
        return true
    }

})

module.exports = Store
