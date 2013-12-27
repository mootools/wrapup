"use strict";

var escodegen = require('escodegen')
var esmangle  = require('esmangle')

function generateModuleVerbatim(ast, options){
    return escodegen.generate(ast)
}

module.exports = generateModuleVerbatim
