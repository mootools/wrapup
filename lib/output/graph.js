"use strict";

var path = require('path')
var prime = require('prime')
var forOwn = require('prime/object/forOwn')
var WrapUpGraphvizRequireError = require('../errors').GraphvizRequireError
var Relative = require('./mixin/relative')

var Graph = prime({

    inherits: require('./'),

    relativeModules: Relative.prototype.relativeModules,

    up: function(callback){

        var graphviz, options = this.options
        var modules = this.relativeModules()

        try {
            graphviz = require('graphviz')
        } catch (err){
            return callback(new WrapUpGraphvizRequireError())
        }

        var graph = graphviz.digraph("G")

        forOwn(modules, function(mod, name){
            graph.addNode(name)
            var deps = mod.deps
            deps.forEach(function(dep){
                graph.addEdge(name, dep)
            })
        })

        var dot = graph.to_dot()

        if (options.output){
            // TODO node-graphviz output gives some troubles with its "dot"
            // child process, probably to just use UNIX pipes for now:
            // wrup -r ... --digraph | dot -Tpng -o test.png
            var ext = path.extname(options.output)
            graph.output(ext.slice(1), options.output)
            this.emit("output", options.output)
        }

        callback(null, dot)

        return this
    }
})

module.exports = Graph
