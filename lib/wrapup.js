"use strict";

var prime   = require('prime')
var Emitter = require('prime/emitter')
var async   = require('async')
var fs      = require('fs')

var Resolver = require('./resolver')
var Storage  = require('./moduleStorage')
var Output   = require('./output/ascii')
var Scanner  = require('./scanner')
var util     = require('./util')

var errors         = require('./errors')
var NamespaceError = errors.NamespaceError
var EmptyError     = errors.EmptyError

var WrapUp = prime({

    inherits: Emitter,

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
        var self = this
        this.scanner = scanner
        scanner.withResolver(this.resolver).withStorage(this.storage)

        scanner.on('warn', function (err) {
            self.emit('warn', err)
        })

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

    unrequire: function(module){
        for (var i = 0; i < this.required.length; i++){
            if (this.required[i][1] == module){
                this.required.splice(i, 1)
                return this
            }
        }
    },

    up: function(callback){

        var scanner = this.scanner
        var storage = this.storage
        var output  = this.output

        var named = {}

        // required modules that need to be scanned
        var required = util.clone(this.required)
        // but invalidates needs to be rescanned too
        var invalidates = this.storage.getInvalidates()
        for (var k in invalidates) required.push([invalidates[k].namespace, k, true])

        storage.resetRoots()

        async.each(required, function(m, callback){
            var namespace = m[0], module = m[1], invalid = m[2]

            if (namespace){
                if (named[namespace]) return callback(new NamespaceError(namespace, module))
                named[namespace] = true
            }

            scanner.scan(module, null, function(err, module){
                if (module){
                    if (namespace) module.namespace = namespace
                    if (!invalid) module.root = true
                }
                callback()
            })

        }, function(e){

            storage.clean()

            var err
            if (e) err = e
            else if (storage.isEmpty()) err = new EmptyError()
            if (err) return callback(err)

            output.up(callback)

        })
    },

    watch: function(callback){
        var self = this, watchers = {}

        var changed = function(file){
            for (var p in watchers) watchers[p].close()
            self.emit('change', file)
            self.watch(callback)
        }

        this.up(function(err, data){

            callback(err, data)

            self.storage.each(function(module, fullpath){
                var enoentTimes = 0
                // we need an throttle, because it sometimes happens that the
                // watch callback is called multiple times for the same change.
                var handler = util.throttle(function(){
                    fs.stat(fullpath, function(err, stat){
                        // the file was remove, but be sure it is, so test it
                        // an arbitrary 30 times
                        if (err && err.code == 'ENOENT'){
                            if (enoentTimes++ > 30){
                                self.storage.remove(fullpath)
                                changed(fullpath)
                            } else {
                                handler()
                            }
                        }
                        // something else gone wrong
                        else if (err) callback(err)
                        // file has changed its content
                        else changed(fullpath)
                    })
                })
                watchers[fullpath] = fs.watch(fullpath, function(){
                    enoentTimes = 0
                    // remove the module from the cache, so it will be re-parsed
                    self.storage.invalidate(fullpath)
                    handler()
                })
            })

        })

    }

})

module.exports = WrapUp
