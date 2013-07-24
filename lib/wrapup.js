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

    unrequire: function(module){
        for (var i = 0; i < this.required.length; i++){
            if (this.required[i][1] == module){
                this.required.splice(i, 1)
                return this
            }
        }
    },

    up: function(callback){
        var self = this
        var named = []

        var required = util.clone(this.required)
        var invalidates = this.storage.getInvalidates()
        for (var k in invalidates) required.push([invalidates[k].namespace, k, true])

        var roots = []

        async.each(required, function(m, callback){
            var namespace = m[0], module = m[1], invalid = m[2]

            if (namespace && named[namespace]){
                return callback(new NamespaceError(namespace, module))
            }

            self.scanner.scan(module, null, function(err, module){
                if (module){
                    if (namespace) module.namespace = namespace
                    else if (!invalid) module.namespace = null
                    roots.push(module)
                }
                callback()
            })

        }, function(e){

            self.cleanStorage(roots)

            var err
            if (e) err = e
            else if (self.storage.isEmpty()) err = new EmptyError()
            if (err) return callback(err)

            self.output.up(callback)

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

    },

    // remove files that are not required by anything anymore are removed from
    // the cache
    cleanStorage: function(roots){
        var storage = this.storage
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

        storage.each(function(mod, full){
            if (!cleaned[full]) storage.remove(full)
        })
    }

})

module.exports = WrapUp
