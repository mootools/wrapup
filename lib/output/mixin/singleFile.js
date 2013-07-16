"use strict";

var fs        = require('fs')
var prime     = require('prime')
var escodegen = require('escodegen')
var esmangle  = require('esmangle')
var async     = require('async')
var util      = require('../../util')

module.exports = prime({

    outputSingleFile: function(wrapper, callback){

        var options   = this.options
        var compress  = options.compress
        var sourcemap = options.sourcemap
        var self = this

        if (compress) wrapper = esmangle.mangle(wrapper)

        var code, map

        var escodegenOptions = {
            format: compress ? {
                renumber: true,
                hexadecimal: true,
                escapeless: true,
                compact: true,
                semicolons: false,
                parentheses: false
            } : {}
        }

        if (sourcemap){
            map = escodegen.generate(wrapper, util.merge({
                sourceMap: true,
                sourceMapRoot: options.sourcemapRoot
            }, escodegenOptions))
        }

        if (!options.ast){
            code = escodegen.generate(wrapper, escodegenOptions)
            if (sourcemap) code += "\n//# sourceMappingURL=" + (options.sourcemapURL || sourcemap) + "\n"
        } else {
            if (compress) code = JSON.stringify(wrapper)
            else code = JSON.stringify(wrapper, null, 2)
        }

        var tasks = []

        if (sourcemap){
            tasks.push(function(callback){
                fs.writeFile(sourcemap, map + "", "utf-8", function(err){
                    if (!err) self.emit("output", sourcemap)
                    callback(err)
                })
            })
        }

        if (options.output){
            tasks.push(function(callback){
                fs.writeFile(options.output, code, "utf-8", function(err){
                    if (!err) self.emit('output', options.output)
                    callback(err)
                })
            })
        }

        async.parallel(tasks, function(err){
            callback(err, code)
        })
    }

})
