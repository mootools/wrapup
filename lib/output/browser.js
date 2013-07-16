"use strict";

var fs         = require('fs')
var prime      = require('prime')
var forOwn     = require('prime/object/forOwn')
var async      = require('async')
var util       = require('../util')
var singleFile = require('./_singleFile')
var Output     = require('./output')

var getWrapperAST  = util.getAST('browser-wrapper')
var getModuleAST   = util.getAST('browser-module')
var getNamedAST    = util.getAST('browser-named')
var getNamelessAST = util.getAST('browser-nameless')
var getVarNamedAST = util.getAST('var-named')

var Browser = prime({

    inherits: Output,

    // mixin method
    outputSingleFile: singleFile.prototype.outputSingleFile,

    up: function(callback){
        var self = this
        async.parallel([
            getWrapperAST,
            this.options.globalize ? getNamedAST : getVarNamedAST,
            getModuleAST,
            getNamelessAST
        ], function(err, results){
            if (err) return callback(err)
            self.output(callback, results[0], results[1], results[2], results[3])
        })
        return this
    },

    output: function(callback, wrapperAST, namedAST, moduleAST, namelessAST){

        var self      = this
        var options   = this.options
        var storage   = this.storage
        var globalize = options.globalize
        var wrapper   = util.clone(wrapperAST)
        var varStmts  = []

        // the closure function
        var wrapperClosure = wrapper.body[0].expression

        // the position where we can insert the modules
        var properties = wrapperClosure['arguments'][0].properties

        storage.each(function(module){

            if (module.err) return

            var ast = util.clone(module.ast)

            // replace require() calls
            Output.replaceRequire(ast, module)

            // module key and value
            var newAST = util.clone(moduleAST.body[0].declarations[0].init.properties[0])
            newAST.key.value = module.uid

            // put the module JS into the module function
            var body = newAST.value.body.body
            for (var i = 0; i < ast.body.length; i++){
                body.push(ast.body[i])
            }

            // and the module function in the "modules" object
            properties.push(newAST)
        })

        // body where to place "require('0')" and "window['foo'] = require('1')"
        var wrapperBody = wrapperClosure.callee.body.body

        var named = storage.getNamespaced()

        // "global[name] = require('...')" named modules, that need to be exported
        forOwn(named.namespaced, function(module){
            var uid = module.uid, name = module.namespace
            var named = util.clone(namedAST.body[0])
            var expression = named.expression, left = expression.left
            if (globalize){
                // adding modules to a global object inside the wrapper closure
                left.object.name = globalize
                left.property.value = name
                expression.right['arguments'][0].value = uid
            } else {
                // adding global var statements at the top of the file
                left.name = name
                expression.right['arguments'][0].value = uid
                varStmts.push({
                    type: "VariableDeclarator",
                    id: {type: "Identifier", name: name}
                })
            }
            wrapperBody.push(named)
        })

        if (varStmts.length) wrapper.body.unshift({
            type: "VariableDeclaration", declarations: varStmts, kind: "var"
        })

        // nameless requires, "require("...")"
        named.nameless.forEach(function(module){
            var nameless = util.clone(namelessAST.body[0])
            nameless.expression['arguments'][0].value = module.uid
            wrapperBody.push(nameless)
        })

        this.outputSingleFile(wrapper, callback)

    }

})

module.exports = Browser
