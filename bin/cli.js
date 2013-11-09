"use strict";

var WrapUp  = require('../lib/wrapup')
var program = require('commander')
var chalk   = require('chalk')
var json    = require('../package')
var path    = require('path')
var error   = require('./errorHandler')

var wrapup = new WrapUp()

wrapup.on('change', function(file){
    console.warn("=>".blue.inverse + " " + path.relative(process.cwd(), file).grey + " was changed")
})

wrapup.scanner.on('warn', function(err){
    error.errorHandler(err, true)
})

program
    .version(json.version)
    .option('-r, --require <path>', 'requires a module. Uses node to resolve modules. If the form namepace=path is used the module will use a namespace')
    .option('-w, --watch', 'watch changes to every resolved module and wraps up')
    .option('--in-path <path>', 'all required files should be in this path')

program.on('require', function(option){
    var parts = option.split('=')
    if (parts.length > 1) wrapup.require(parts[0], parts[1])
    else wrapup.require(option)
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
