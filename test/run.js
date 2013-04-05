"use strict";

var fs        = require('fs')
var esprima   = require('esprima')
var assert    = require('assert')
var path      = require('path')
var escodegen = require('escodegen')
var diff      = require('ansidiff')
require("colors")

var parse = function(file){
    var code = fs.readFileSync(file, "utf-8")
    return esprima.parse(code)
}

var relative = function(file){
    return path.relative(process.cwd(), file)
}

exports.passed = function(test){
    console.log(("✔ " + test + " test passed").green)
}

exports.test = function(test, transformResult, transformShould){
    var result = __dirname + '/output/' + test + '.result.js'
    var should = __dirname + '/output/' + test + '.js'
    var resultAST = parse(result)
    var shouldAST = parse(should)
    if (transformResult) resultAST = transformResult(resultAST)
    if (transformShould) shouldAST = transformShould(shouldAST)
    try {
        assert.deepEqual(resultAST, shouldAST, relative(result) + " and " + relative(should) + " should be the same")
        exports.passed(test)
    } catch (e){
        var shouldJS = escodegen.generate(shouldAST)
        var resultJS = escodegen.generate(resultAST)
        console.log(diff.words(shouldJS, resultJS))
        throw e
    }
}

if (process.argv.length > 2){
    require('./' + process.argv[2])
} else {
    require('./up')
    require('./pipe')
    require('./globalize')
    require('./notresolved')
    require('./compress')
    require('./ast')
    require('./graph')
    require('./sourcemap')
    require('./wrup')
    require('./js-error')
    require('./amdOneFile')
}
