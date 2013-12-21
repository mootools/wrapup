"use strict";
// this exports a "masked" factory function of the WrapUp "class"

var WrapUp = require("./wrapup")
var Browser = require("./output/browser")
var Graph = require("./output/graph")
var AMDOne = require("./output/amdOneFile")

module.exports = function(options){
    if (!options) options = {}
    var wrapup = new WrapUp()
    var output

    wrapup.scanner.set('inPath', options.inPath)

    if (options.graph){
        output = new Graph()
    } else {

        if (options.amdOneFile) output = new AMDOne()
        else output = new Browser()

        output.set('output', options.output)
        output.set('globalize', options.globalize)
        output.set('compress', options.compress)
        output.set('path', options.path)
        output.set('ast', options.ast)

        wrapup.scanner.set('sourcemap', options.sourcemap)
        output.set('sourcemap', options.sourcemap)
        output.set('sourcemapURL', options.sourcemapURL)
        output.set('sourcemapRoot', options.sourcemapRoot)
    }

    wrapup.withOutput(output)

    return wrapup
}
