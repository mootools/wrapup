"use strict";

var WrapUp  = require("../lib/wrapup")
var program = require("commander")
var colors  = require("colors")
var json    = require("../package")
var path    = require("path")

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

program.command('ascii')
    .description('list the dependencies as a tree')
    .action(function(){
        wrapup.up(function(err, str){
            if (err) errorHandler(err)
            else proc.stdout.write(str)
        })
    })

program.outputHelp = function(){
    // header
    console.warn(" , , , __  __.  _   . . _  ".white)
    console.warn("(_(_/_/ (_(_/|_/_)_(_/_/_)_".grey)
    console.warn("              /       /  " + json.version.white + "\n")
    process.stdout.write(this.helpInformation());
}

function errorHandler(err){
    throw err
}

module.exports = function(process){
    program.parse(process.argv)
}