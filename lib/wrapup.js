"use strict";

var prime = require('prime')
var async = require('async')
var fs    = require('fs')

var Resolver = require('./resolver')
var Storage  = require('./moduleStorage')
var Output   = require('./output/ascii')
var Scanner  = require('./scanner')
var util     = require('./util')

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

    watch: function(callback){
        var self = this, watchers = {}

        var changed = function(file){
            for (var p in watchers) watchers[p].close()
            self.storage.remove(file)
            self.up(callback)
        }

        this.up(function(){

            self.storage.each(function(module, fullpath){
                // we need an throttle, because it sometimes happens that the
                // watch callback is called multiple times for the same change.
                watchers[fullpath] = fs.watch(fullpath, util.throttle(function(){
                    fs.stat(fullpath, "utf-8", function(err){
                        // the file was removed
                        if (err && err.code == 'ENOENT') changed(fullpath)
                        // something else gone wrong
                        else if (err) callback(err)
                        // file has changed its content
                        else changed(fullpath)
                    })
                }))
            })

        })

    }

})

module.exports = WrapUp
