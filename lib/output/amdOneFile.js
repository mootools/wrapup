"use strict";

var fs         = require('fs')
var path       = require('path')
var prime      = require('prime')
var async      = require('async')
var util       = require('../util')
var errors     = require('../errors')
var singleFile = require('./_singleFile')
var byID       = require('./_modulesByID')

var getDefineAST  = util.getAST('amdOneFile-module')
var getWrapperAST = util.getAST('amdOneFile-wrapper')

var uid = 0

var output = prime({

    inherits: require('./'),

    // mixin method
    outputSingleFile: singleFile.prototype.outputSingleFile,
    modulesByID: byID.prototype.modulesByID,

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

        var self      = this
        var options   = this._options
        var compress  = options.compress
        var sourcemap = options.sourcemap
        var byID      = this.modulesByID()

        // contains boilerplate
        var wrapper = util.clone(wrapperAST)

        prime.each(this.modules, function(module){

            if (module.err) return

            var newAST = util.clone(defineAST.body[0])
            var args = newAST.expression['arguments']

            // change module ID
            args[0].value = module.fileID

            // body of the define function
            var body = args[1].body.body

            // put the module JS in the define factory function
            var ast = module.ast.body
            for (var i = 0; i < ast.length; i++){
                body.push(ast[i])
            }

            // and add the define() function to the wrapper
            wrapper.body.push(newAST)

            // resolve require() inside this module
            for (var r = 0; r < module.requires.length; r++){
                var req = module.requires[r]
                var dep = module.deps[r]
                if (dep){
                    req.require['arguments'][0].value = byID[dep].fileID
                } else {
                    req.parent[req.key] = {type: "Literal", value: null}
                }
            }

        })

        this.outputSingleFile(wrapper, callback)

    }

})

module.exports = function(wrup, callback){
    new output(wrup).up(callback)
}
