"use strict";

var prime = require('prime')
var async = require('async')

var Resolver = require('./resolver')
var Storage  = require('./moduleStorage')
var Output   = require('./output/ascii')
var Scanner  = require('./scanner')

var errors         = require('./errors')
var NamespaceError = errors.NamespaceError
var EmptyError     = errors.EmptyError

var WrapUp = prime({

    constructor: function(){
        this.withResolver(new Resolver())
            .withStorage(new Storage())
            .withScanner(new Scanner())
            .withOutput(new Output())
        this.required = []
    },

    withResolver: function(resolver){
        this.resolver = resolver
        if (this.scanner) this.scanner.withResolver(resolver)
        return this
    },

    withStorage: function(storage){
        this.storage = storage
        if (this.scanner) this.scanner.withStorage(storage)
        if (this.output) this.output.withStorage(storage)
        return this
    },

    withScanner: function(scanner){
        this.scanner = scanner
        scanner.withResolver(this.resolver).withStorage(this.storage)
        return this
    },

    withOutput: function(output){
        this.output = output
        output.withStorage(this.storage)
        return this
    },

    require: function(namespace, module){
        if (module == null){
            module = namespace
            namespace = null
        }
        this.required.push([namespace, module])
        return this
    },

    up: function(callback){
        var self = this
        var named = [], err

        async.each(this.required, function(m, callback){
            var namespace = m[0], module = m[1]

            if (namespace && named[namespace]){
                return callback(new NamespaceError(namespace, module))
            }

            self.scanner.scan(module, null, function(e, module){
                if (e) err = e
                else if (namespace) module.namespace = namespace
                callback()
            })

        }, function(e){

            if (e) err = e
            if (!err && self.storage.isEmpty()) err = new EmptyError()
            if (err) return callback(err)

            self.output.up(callback)

        })
    },

    watch: function(){



    }

})

module.exports = WrapUp
