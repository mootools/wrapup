"use strict";

var prime    = require('prime')
var Emitter  = require('prime/emitter')
var fs       = require("fs")
var esprima  = require('esprima')
var async    = require('async')
var util     = require('./util')

var errors                = require('./errors')
var WrapUpNativeError     = errors.NativeError
var WrapUpNotInPathError  = errors.NotInPathError
var WrapUpResolveError    = errors.ResolveError
var WrapUpJavaScriptError = errors.JavaScriptError

var Scanner = prime({

    inherits: Emitter,

    constructor: function(resolver, storage){
        this.withResolver(resolver).withStorage(storage)
        this.options = {}
        this.index = 0
    },

    withResolver: function(resolver){
        this.resolver = resolver
        return this
    },

    withStorage: function(storage){
        this.storage = storage
        return this
    },

    withOptions: function(options){
        this.options = options
        return this
    },

    scan: function(what, from, callback){

        var resolver = this.resolver
        var storage  = this.storage

        var modulefull = resolver.resolve(what, from)
        var self = this, err

        if (modulefull == null){
            this.emit("warn", err = new WrapUpResolveError(what, from))
            return callback(err)
        }

        if (modulefull === true){
            this.emit("warn", err = new WrapUpNativeError(what, from))
            return callback(err)
        }

        var inPath = this.options.inPath
        if (inPath && !util.inPath(inPath, modulefull)){
            this.emit("warn", err = new WrapUpNotInPathError(what, from, inPath))
            return callback(err)
        }

        var module = storage.get(modulefull)
        if (module && !module.invalid) return callback(null, module)

        module = {
            full: modulefull,
            uid: (this.index++).toString(36),
            deps: [],
            requires: [],
            ast: null,
            src: "",
            namespace: "",
            ready: false
        }

        storage.put(modulefull, module)

        fs.readFile(modulefull, "utf-8", function(err, src){
            if (err && err.code == 'ENOENT'){
                // It is possible that .resolve still resolves the file
                // correctly, but that the file actually doesn't exist anymore.
                // Then still fire the "warn" event that the file cannot be
                // resolved
                this.emit("warn", err = new WrapUpResolveError(what, from))
            }

            if (err) return callback(err)

            module.src = src

            // parse the code with esprima to see if there are any errors and
            // so we can walk through the AST to find require()s
            try {
                module.ast = esprima.parse(src, {
                    source: util.relative(modulefull), // see https://github.com/ariya/esprima/pull/148
                    loc: true
                })
            } catch (e){
                // add to the object so it will be watched for newer versions
                module.err = true
                self.emit("warn", err = new WrapUpJavaScriptError(modulefull, from, e.lineNumber, e.column))
                return callback(err)
            }

            self.findRequires(module, function(){
                module.ready = true
                self.emit('scan', module)
                callback(null, module)
            })
        })
    },

    findRequires: function(module, callback){
        var self = this

        util.astWalker(module.ast, function(ast, parent, key, path){
            if (ast &&
                    (ast.type == "CallExpression" || ast.type == "NewExpression") &&
                    ast.callee.name == "require"){
                module.requires.push({path: path, ast: ast})
                return true
            }
        })

        async.forEach(module.requires, function(require, callback){
            var dep = require.ast['arguments'].length == 1 && require.ast['arguments'][0].value
            // note that deps also contains "null" values if the module could
            // not be resolved. This way an output prime can determine to
            // remove the require, or do something else with it.
            if (!dep){
                module.deps.push(null)
                callback()
            } else self.scan(dep, module.full, function(err, mod){
                module.deps.push(mod ? mod : null)
                callback()
            })
        }, callback)
    }

})

module.exports = Scanner
