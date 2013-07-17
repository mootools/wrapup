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
var AMD     = require('../lib/output/amd')

function errorHandler(err, watch){

    var title = err.message, message, dmessage

    switch (err.type){
        case "graphviz": break

        case "js":
            dmessage = "on " + err.module.yellow +
                " required by " + err.source.yellow +
                " at line " + err.line + ", column " + err.col
            message = err.module + " on line " + err.line + ", column " + err.col
            break

        case "resolve":
            dmessage = "on module " + err.module.yellow + " required by " + err.source.yellow
            message  = err.module + " < " + err.source
            break

        case "empty": break

        case "namespace":
            dmessage = err.namespace.yellow + " already in use by " + err.module.yellow
            message = err.namespace + " in use by " + err.module
            break

        case "native":
            dmessage = "on module " + err.module.yellow + " required by " + err.source.yellow
            message = "on module " + err.module + " required by " + err.source
            break

        case "not-in-path":
            dmessage = "on module " + err.module.yellow + " required by " +
                err.source.yellow + ". File should be in " + err.path.yellow
            message = "on module " + err.module + " required by " +
                err.source + ". File should be in " + err.path
            break

        case "out-of-scope":
            dmessage = "on file " + err.file.yellow
            message = "on file " + err.file
            break

    }

    console.error(title.red.inverse + (dmessage ? ": " + dmessage : ""))

    if (!watch) process.exit(1)
}


function write(watch){
    return function(err, str){
        if (err) errorHandler(err, watch)
        else console.log(str)
    }
}

function upCallback(args){
    return function(err, str){
        if (err) errorHandler(err)
        else if (!args.output) console.log(str)
        console.warn("DONE".green.inverse)
    }
}

function watchCallback(args){
    return function(err, str){
        if (err) errorHandler(err, true)
    }
}

var wrapup = new WrapUp()

wrapup.on('change', function(file){
    console.warn("=>".blue.inverse + " " + path.relative(process.cwd(), file).grey + " was changed")
})

wrapup.scanner.on('warn', function(err){
    errorHandler(err, true)
})

program
    .version(json.version)
    .option('-r, --require <path>', 'requires a module. Uses node to resolve modules. If the form namepace=path is used the module will use a namespace')
    .option('-w, --watch', 'watch changes to every resolved module and wraps up')
    .option('--in-path <path>', 'all required files should be in this path')

program.on('require', function(option){
    var index = option.indexOf('=')
    if (index != -1) wrapup.require(option.slice(0, index), option.slice(index + 1))
    else wrapup.require(option)
})

program.on('in-path', function(option){
    wrapup.scanner.set('inPath', program.inPath)
})

program.command('ascii')
    .description('list the dependencies as a tree')
    .action(function(){
        wrapup.withOutput(new ASCII())
        if (program.watch) wrapup.watch(write(true))
        else wrapup.up(write(false))
    })

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
            .up(upCallback(args))
    })

var browser = program.command('browser')
    .description('output the combined javascript')
    .option('-o, --output [path]', 'write the output to a file.')
    .option('--globalize [object]', 'define the global scope where named modules are attached to, defaults to window. If this option is not set it uses global var statements.')
    .option('--compress', 'minify the resulting JavaScript')
    .option('--source-map <file>', 'Specify an output file where to generate source map.')
    .option('--source-map-url <url>', '//# sourceMappingURL value, URL to the saved sourcemap file.')
    .option('--source-map-root <path>', 'The path to the original source to be included in the source map.')
    .option('--ast', 'Output the Abstract Syntax Tree as JSON')
    .action(function(args){
        var browser = new Browser()
        browser.set('output', args.output)
        browser.set('globalize', args.globalize === true ? 'window' : args.globalize)
        browser.set('compress', args.compress)
        browser.set('sourcemap', args.sourceMap)
        browser.set('sourcemapURL', args.sourceMapUrl)
        browser.set('sourcemapRoot', args.sourceMapRoot)
        wrapup.scanner.set('sourcemap', args.sourceMap)
        browser.set('ast', args.ast)
        wrapup.withOutput(browser)
        if (program.watch && !args.output){
            console.error('when using the --watch option, the --output option is required')
            return
        }
        browser.on('output', function(file){
            console.warn("The file " + file.grey + " has been written")
        })
        if (program.watch) wrapup.watch(watchCallback(args))
        else wrapup.up(upCallback(args))
    })

program.command('amd-combined')
    .description('convert to AMD format and combine the modules into one file')
    .option('-o, --output [path]', 'write the output to a file.')
    .option('--compress', 'minify the resulting JavaScript')
    .option('--path <path>', 'The base path of the modules, so <path>/bar/foo.js becomes bar/foo as module ID')
    .option('--source-map <file>', 'Specify an output file where to generate source map.')
    .option('--source-map-url <url>', '//# sourceMappingURL value, URL to the saved sourcemap file.')
    .option('--source-map-root <path>', 'The path to the original source to be included in the source map.')
    .option('--ast', 'Output the Abstract Syntax Tree as JSON')
    .action(function(args){
        var amd = new AMDOne()
        amd.set('output', args.output)
        amd.set('compress', args.compress)
        amd.set('path', args.path)
        amd.set('sourcemap', args.sourceMap)
        amd.set('sourcemapURL', args.sourceMapUrl)
        amd.set('sourcemapRoot', args.sourceMapRoot)
        wrapup.scanner.set('sourcemap', args.sourceMap)
        amd.set('ast', args.ast)
        wrapup.withOutput(amd)
        amd.on('output', function(file){
            console.warn("The file " + file.grey + " has been written")
        })
        if (program.watch && !args.output){
            console.error('when using the --watch option, the --output option is required')
            return
        }
        if (program.watch) wrapup.watch(watchCallback(args))
        else wrapup.up(upCallback(args))
    })

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
            console.warn("The file " + file.grey + " has been written")
        })
        if (program.watch){
            wrapup.watch(function(err){
                if (err) errorHandler(err, true)
            })
        } else {
            wrapup.up(function(err){
                if (err) errorHandler(err)
                else console.warn("DONE".green.inverse)
            })
        }
    })

program.outputHelp = function(){
    // header
    console.warn(" , , , __  __.  _   . . _  ".white)
    console.warn("(_(_/_/ (_(_/|_/_)_(_/_/_)_".grey)
    console.warn("              /       /  " + json.version.white + "\n")
    process.stdout.write(this.helpInformation());
}

exports = module.exports = program
exports.wrapup = wrapup
