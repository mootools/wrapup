"use strict";

var Graph   = require('../lib/output/graph')
var error   = require('./errorHandler')
var chalk   = require('chalk')

module.exports = function(program, wrapup){
    program.command('graph')
        .description('create a graphviz structured dependency graph')
        .option('-o, --output [path]', 'write the output to a file.')
        .action(function(args){
            var graph = new Graph()
            graph.set('output', args.output)
            graph.on('output', function(file){
                console.warn("The file " + chalk.grey(file) + " has been written")
            })
            wrapup
                .withOutput(graph)
                .up(error.upCallback(args))
        })
}
