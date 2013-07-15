"use strict";

var prime = require('prime')
var Emitter = require('prime/emitter')

var Store = prime({

    inherits: Emitter,

    put: function(filename, data){
        var storage = this._storage || (this._storage = {})
        storage[filename] = data
        this.emit('put', filename)
        return this
    },

    get: function(filename){
        return this._storage ? this._storage[filename] : undefined
    },

    remove: function(filename){
        if (this._storage){
            delete this._storage[filename]
            this.emit('remove')
        }
        return this
    },

    keys: function(){
        return Object.keys(this._storage || {})
    }

})

module.exports = Store
