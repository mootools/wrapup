"use strict";

var ASCII = require('../lib/output/ascii')
var error = require('./errorHandler')

module.exports = function(program, wrapup){
    program.command('ascii')
        .description('list the dependencies as a tree')
        .action(function(){
            wrapup.withOutput(new ASCII())
            if (program.watch) wrapup.watch(error.write(true))
            else wrapup.up(error.write(false))
        })
}

