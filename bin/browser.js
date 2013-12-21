"use strict";

var Browser = require('../lib/output/browser')
var error   = require('./errorHandler')
var chalk   = require('chalk')

module.exports = function(program, wrapup){
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
                console.warn("The file " + chalk.grey(file) + " has been written")
            })
            if (program.watch) wrapup.watch(error.watchCallback(args))
            else wrapup.up(error.upCallback(args))
        })
}
