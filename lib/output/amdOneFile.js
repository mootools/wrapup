"use strict";

var prime       = require('prime')
var forOwn      = require('prime/object/forOwn')
var async       = require('async')
var util        = require('../util')
var errors      = require('../errors')
var Output      = require('./')
var SingleFile  = require('./mixin/singleFile')
var ModulesByID = require('./mixin/modulesByID')
var generateModuleVerbatim = require('./mixin/generateModuleVerbatim')

var getDefineAST  = util.getAST('amdOneFile-module')
var getWrapperAST = util.getAST('amdOneFile-wrapper')

var AMD = prime({

    inherits: Output,

    // mixin method
    outputSingleFile: SingleFile.prototype.outputSingleFile,
    modulesByID: ModulesByID.prototype.modulesByID,

    up: function(callback){
        var self = this
        async.parallel([
            getDefineAST,
            getWrapperAST
        ], function(err, results){
            if (err) callback(err)
            else self.output(callback, results[0], results[1])
        })
        return this
    },

    output: function(callback, defineAST, wrapperAST){

        var self    = this
        var modules = this.modulesByID()
        var options = this.options
        var _path   = (options.path ? options.path : process.cwd()) + '/a'

        // contains boilerplate
        var wrapper = util.clone(wrapperAST)

        forOwn(modules, function(module){

            if (module.err) return
            if (!module.srcOut || !module.astOut){

                var file = module.getModuleFile(_path)
                if (file.slice(0, 5) == '__oos'){
                    self.emit("warn", new errors.OutOfScopeError(module.full))
                }

                var ast = util.clone(module.ast)

                // replace require() calls
                Output.replaceRequire(ast, module, function(dep){
                    return dep.getModuleID(_path)
                })

                var newAST = util.clone(defineAST.body[0])
                var args = newAST.expression['arguments']

                // change module ID
                args[0].value = module.getModuleID(_path)

                // body of the define function
                var body = args[1].body.body
                // put the module JS in the define factory function
                for (var i = 0; i < ast.body.length; i++){
                    body.push(ast.body[i])
                }

                module.astOut = newAST
                module.srcOut = generateModuleVerbatim(newAST, options)

            }

            // and add the define() function to the wrapper
            wrapper.body.push({
                type: 'ExpressionStatement',
                expression: {
                    type: 'Literal',
                    'x-wrup-verbatim': module.srcOut
                }
            })

        })

        this.outputSingleFile(wrapper, callback)
    }

})

module.exports = AMD
