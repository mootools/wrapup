"use strict";

var prime       = require('prime')
var forOwn      = require('prime/object/forOwn')
var async       = require('async')
var Output      = require('./')
var util        = require('../util')
var SingleFile  = require('./mixin/singleFile')
var ModulesByID = require('./mixin/modulesByID')

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

        // contains boilerplate
        var wrapper = util.clone(wrapperAST)

        forOwn(modules, function(module){

            if (module.err) return

            var ast = util.clone(module.ast)

            // replace require() calls
            Output.replaceRequire(ast, module, 'fileID')

            var newAST = util.clone(defineAST.body[0])
            var args = newAST.expression['arguments']

            // change module ID
            args[0].value = module.fileID

            // body of the define function
            var body = args[1].body.body
            // put the module JS in the define factory function
            for (var i = 0; i < ast.body.length; i++){
                body.push(ast.body[i])
            }

            // and add the define() function to the wrapper
            wrapper.body.push(newAST)

        })

        this.outputSingleFile(wrapper, callback)
    }

})

module.exports = AMD
