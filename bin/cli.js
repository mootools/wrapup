"use strict";

var path     = require('path')
var program  = require('commander')
var chalk    = require('chalk')
var relative = require('require-relative').resolve
var WrapUp   = require('../lib/wrapup')
var json     = require('../package')
var error    = require('./errorHandler')

var wrapup = new WrapUp()

wrapup.on('change', function(file){
    console.warn(chalk.blue.inverse("=>") + " " + chalk.grey(path.relative(process.cwd(), file)) + " was changed")
})

wrapup.scanner.on('warn', function(err){
    error.errorHandler(err, true)
})

program
    .version(json.version)
    .option('-r, --require <path>', 'requires a module. Uses node to resolve modules. If the form namespace=path is used the module will use a namespace')
    .option('-t, --transform <module>', 'requires a module for transforming source code of modules')
    .option('-w, --watch', 'watch changes to every resolved module and wraps up')
    .option('-t, --transform', 'a module that can transform source code or ASTs')
    .option('--in-path <path>', 'all required files should be in this path')

program.on('require', function(option){
    var parts = option.split('=')
    if (parts.length > 1) wrapup.require(parts[0], parts[1])
    else wrapup.require(option)
})

program.on('transform', function(option){
    wrapup.scanner.addTransform(require(relative(option)))
})

program.on('in-path', function(option){
    wrapup.scanner.set('inPath', program.inPath)
})

require('./ascii')(program, wrapup)
require('./graph')(program, wrapup)
require('./browser')(program, wrapup)
require('./amdCombined')(program, wrapup)
require('./amd')(program, wrapup)

program.outputHelp = function(){
    // header
    console.warn(chalk.grey(" , , , __  __.  _   . . _  "))
    console.warn(chalk.grey("(_(_/_/ (_(_/|_/_)_(_/_/_)_"))
    console.warn(chalk.grey("              /       /  " + json.version) + "\n")
    process.stdout.write(this.helpInformation());
}

exports = module.exports = program
exports.wrapup = wrapup
