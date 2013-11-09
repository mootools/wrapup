"use strict";

var prime    = require('prime')
var Emitter  = require('prime/emitter')
var fs       = require("fs")
var esprima  = require('esprima')
var async    = require('async')
var util     = require('./util')
var Module   = require('./module')

var errors          = require('./errors')
var NativeError     = errors.NativeError
var NotInPathError  = errors.NotInPathError
var ResolveError    = errors.ResolveError
var JavaScriptError = errors.JavaScriptError

var Scanner = prime({

    inherits: Emitter,

    constructor: function(resolver, storage){
        this.withResolver(resolver).withStorage(storage)
        this.options = {}
        this.index = 0
        this.uids = {}
        this.transforms = []
    },

    withResolver: function(resolver){
        this.resolver = resolver
        return this
    },

    withStorage: function(storage){
        this.storage = storage
        return this
    },

    addTransform: function(transform){
        this.transforms.push(transform)
        return this
    },

    set: function(option, value){
        this.options[option] = value
        return this
    },

    scan: function(what, from, callback){

        var resolver = this.resolver
        var storage  = this.storage

        var modulefull = resolver.resolve(what, from)
        var self = this

        if (modulefull == null){
            this.emit("warn", new ResolveError(what, from))
            return callback()
        }

        if (modulefull === true){
            this.emit("warn", new NativeError(what, from))
            return callback()
        }

        var inPath = this.options.inPath
        if (inPath && !util.inPath(inPath, modulefull)){
            this.emit("warn", new NotInPathError(what, from, inPath))
            return callback()
        }

        // check if we already have this module and it's still valid
        var module = storage.get(modulefull)
        if (module && !module.invalid) return callback(null, module)

        if (module && module.invalid){
            // make the module valid again, it will be reparsed now
            module.invalid = false
        } else {
            // only create a new module object if it didn't exist yet
            module = new Module(modulefull, this.uids[modulefull] || (this.index++).toString(36))
            // ensure the file is always associated with the same uid
            this.uids[modulefull] = module.uid
        }

        storage.put(module)

        var transforms = []

        // from filename to code
        transforms.push(function(module, callback){
            fs.readFile(module.full, 'utf-8', function(err, src){

                if (err && err.code == 'ENOENT'){
                    // It is possible that .resolve still resolves the file
                    // correctly, but that the file actually doesn't exist anymore.
                    // Then still fire the "warn" event that the file cannot be
                    // resolved
                    self.emit("warn", new ResolveError(what, from))
                }

                module.src = src
                callback(err, module)

            })
        })

        var pushTransform = function(type){
            return function(transform){
                transforms.push(function(module, callback){
                    var trsfrm = transform[type]
                    if (!trsfrm) callback(null, module)
                    else trsfrm(module, callback)
                })
            }
        }

        // some code transformations
        this.transforms.forEach(pushTransform('src'))

        // from code to AST
        transforms.push(function(module, callback){

            // parse the code with esprima to see if there are any errors and
            // so we can walk through the AST to find require()s
            try {
                module.ast = esprima.parse(module.src, {
                    loc: true,
                    source: util.relative(module.full)
                })
                callback(null, module)
            } catch (e){
                // add to the object so it will be watched for newer versions
                module.err = true
                var err = new JavaScriptError(modulefull, from, e.lineNumber, e.column)
                self.emit("warn", err)
                callback(err)
            }
        })

        // some AST transformations
        this.transforms.forEach(pushTransform('ast'))

        transforms.push(function(module, callback){
            self.findRequires(module, function(err){
                if (err) return callback(err)
                module.ready = true
                self.emit('scan', module)
                callback(null, module)
            })
        })

        async.reduce(transforms, module, function(memo, item, callback){
            item(memo, callback)
        }, function(err, module){
            if (module && module.err) return
            callback(err, module)
        })
    },

    findRequires: function(module, callback){
        var self = this

        var ast = module.ast
        var sourcemap = this.options.sourcemap && ast.loc && !ast.loc.source
        var source = sourcemap && util.relative(module.full)

        util.astWalker(ast, function(ast, parent, key, path){
            // temporary fix until https://github.com/ariya/esprima/pull/148
            // is pulled and released.
            if (ast && sourcemap && key == 'loc'){
                ast.source = source
                return true
            }

            if (ast &&
                    (ast.type == "CallExpression" || ast.type == "NewExpression") &&
                    ast.callee.name == "require"){
                module.requires.push({
                    path: path,
                    ast: ast,
                    argument: ast['arguments'].length == 1 && ast['arguments'][0].value,
                    i: module.requires.length})
                return true
            }
        })

        async.forEach(module.requires, function(require, callback){
            var dep = require.argument
            // note that deps also contains "null" values if the module could
            // not be resolved. This way an output prime can determine to
            // remove the require, or do something else with it.
            if (!dep){
                module.dependencies[require.i] = null
                callback()
            } else self.scan(dep, module.full, function(err, mod){
                if (err) return callback(err)
                module.dependencies[require.i] = mod ? mod : null
                if (mod) mod.dependents.push(module)
                callback()
            })
        }, callback)
    }

})

module.exports = Scanner
