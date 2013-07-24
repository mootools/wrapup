"use strict";

var prime = require('prime')
var Emitter = require('prime/emitter')
var forOwn = require('prime/object/forOwn')
var filter = require('prime/object/filter')
var Module = require('./module')

var Store = prime({

    inherits: Emitter,

    constructor: function(){
        this._storage = []
    },

    put: function(module){
        if (!(module instanceof Module)){
            throw new Error("the passed module is not a instance of Module");
        }
        this._storage[module.full] = module
        this.emit('put', module)
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

    getNamespaced: function(){
        var name = {nameless: [], namespaced: {}}
        var nameless = name.nameless, namespaced = name.namespaced
        forOwn(this._storage, function(module){
            if (module.namespace) namespaced[module.namespace] = module
            else if (module.namespace === null) nameless.push(module)
        })
        return name
    },

    isEmpty: function(){
        for (var i in this._storage) return false
        return true
    }

})

module.exports = Store
