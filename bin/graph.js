"use strict";

var Graph   = require('../lib/output/graph')
var error   = require('./errorHandler')

module.exports = function(program, wrapup){
    program.command('graph')
        .description('create a graphviz structured dependency graph')
        .option('-o, --output [path]', 'write the output to a file.')
        .action(function(args){
            var graph = new Graph()
            graph.set('output', args.output)
            graph.on('output', function(file){
                console.warn("The file " + file.grey + " has been written")
            })
            wrapup
                .withOutput(graph)
                .up(error.upCallback(args))
        })
}
