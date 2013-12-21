"use strict";

var AMD   = require('../lib/output/amd')
var error = require('./errorHandler')
var chalk = require('chalk')

module.exports = function(program, wrapup){
    program.command('amd')
        .description('convert the modules into the AMD format')
        .option('-o, --output <path>', 'Output directory for the AMD modules')
        .option('--path <path>', 'The base path of the modules, so <path>/bar/foo.js becomes bar/foo as module ID')
        .action(function(args){
            var amd = new AMD()
            amd.set('output', args.output)
            amd.set('path', args.path)
            wrapup.withOutput(amd)
            amd.on('output', function(file){
                console.warn("The file " + chalk.grey(file) + " has been written")
            })
            if (program.watch){
                wrapup.watch(function(err){
                    if (err) error.errorHandler(err, true)
                })
            } else {
                wrapup.up(function(err){
                    if (err) error.errorHandler(err)
                    else console.warn(chalk.green.inverse("DONE"))
                })
            }
        })
}
