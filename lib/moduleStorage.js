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
            module.invalidate()
            this.emit("invalidate", filename)
        }
        return this
    },

    keys: function(){
        return Object.keys(this._storage || {})
    },

    each: function(fn, context){
        forOwn(this._storage, fn, context || this)
        return this
    },

    isEmpty: function(){
        for (var i in this._storage) return false
        return true
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
            if (module.root){
                if (module.namespace) namespaced[module.namespace] = module
                else nameless.push(module)
            }
        })
        return name
    },

    resetRoots: function(){
        this.each(function(mod){
            mod.root = false
        })
    },

    // remove modules that are not required by anything anymore
    clean: function(){

        var roots = []
        this.each(function(mod){
            if (mod.root) roots.push(mod)
        })

        // walk all module dependencies and fill this object with all the
        // modules in the dependency graph from the root modules
        var cleaned = {}

        var clean = function(deps){
            deps.forEach(function(dep){
                if (dep && !cleaned[dep.full]){
                    cleaned[dep.full] = true
                    clean(dep.dependencies)
                }
            })
        }

        clean(roots)

        // each all modules to see which are not in the dependency graph
        // if it's not, remove it from the storage
        this.each(function(mod, full){
            if (!cleaned[full]) this.remove(full)
        })

    }

})

module.exports = Store
