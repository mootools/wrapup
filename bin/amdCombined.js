"use strict";

var AMDOne = require('../lib/output/amdOneFile')
var error  = require('./errorHandler')
var chalk  = require('chalk')

module.exports = function(program, wrapup){
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
                console.warn("The file " + chalk.grey(file) + " has been written")
            })
            if (program.watch && !args.output){
                console.error('when using the --watch option, the --output option is required')
                return
            }
            if (program.watch) wrapup.watch(error.watchCallback(args))
            else wrapup.up(error.upCallback(args))
        })
}
