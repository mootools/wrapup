"use strict";

var WrapUp  = require("../lib/wrapup")
var program = require("commander")
var colors  = require("colors")
var json    = require("../package")
var path    = require("path")

var ASCII   = require('../lib/output/ascii')
var Graph   = require('../lib/output/graph')
var Browser = require('../lib/output/browser')
var AMDOne  = require('../lib/output/amdOneFile')

var wrapup = new WrapUp()

var proc


program
    .version(json.version)
    .option('-r, --require <path>', 'requires a module. Uses node to resolve modules. If the form namepace=path is used the module will use a namespace')
    .option('-w, --watch', 'watch changes to every resolved module and wraps up')

program.on('require', function(option){
    var index = option.indexOf('=')
    if (index != -1) wrapup.require(option.slice(0, index), option.slice(index + 1))
    else wrapup.require(option)
})

function write (watch){
    return function(err, str){
        if (err) errorHandler(err, watch)
        else proc.stdout.write(str)
    }
}

program.command('ascii')
    .description('list the dependencies as a tree')
    .action(function(){
        wrapup.withOutput(new ASCII())
        if (program.watch) wrapup.watch(write(true))
        else wrapup.up(write(false))
    })

program.command('graph')
    .description('create a graphviz structured dependency graph')
    .action(function(){
        wrapup
            .withOutput(new Graph())
            .up(function(err, dot){
                process.stdout.write(dot)
            })
    })

program.command('browser')
    .description('output the combined javascript')
    .action(function(){
        wrapup.withOutput(new Browser())
        if (program.watch) wrapup.watch(write(true))
        else wrapup.up(write(false))
    })

program.command('amd-combined')
    .description('covert to AMD format and combine the modules into one file')
    .action(function(){
        wrapup.withOutput(new AMDOne())
        if (program.watch) wrapup.watch(write(true))
        else wrapup.up(write(false))
    })

program.outputHelp = function(){
    // header
    console.warn(" , , , __  __.  _   . . _  ".white)
    console.warn("(_(_/_/ (_(_/|_/_)_(_/_/_)_".grey)
    console.warn("              /       /  " + json.version.white + "\n")
    process.stdout.write(this.helpInformation());
}

function errorHandler(err, watch){
    if (watch) console.error(err)
    else throw err
}

module.exports = function(process){
    proc = process
    program.parse(process.argv)
    if (!program.args.length) program.help();
}
