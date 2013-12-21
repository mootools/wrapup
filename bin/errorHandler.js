"use strict";

var chalk   = require("chalk")

function errorHandler(err, watch){

    var title = err.message, message, dmessage

    switch (err.type){
        case "graphviz": break

        case "js":
            dmessage = "on " + chalk.yellow(err.module) +
                " required by " + chalk.yellow(err.source) +
                " at line " + err.line + ", column " + err.col
            message = err.module + " on line " + err.line + ", column " + err.col
            break

        case "resolve":
            dmessage = "on module " + chalk.yellow(err.module) + " required by " + chalk.yellow(err.source)
            message  = err.module + " < " + err.source
            break

        case "empty": break

        case "namespace":
            dmessage = chalk.yellow(err.namespace) + " already in use by " + chalk.yellow(err.module)
            message = err.namespace + " in use by " + err.module
            break

        case "native":
            dmessage = "on module " + chalk.yellow(err.module) + " required by " + chalk.yellow(err.source)
            message = "on module " + err.module + " required by " + err.source
            break

        case "not-in-path":
            dmessage = "on module " + chalk.yellow(err.module) + " required by " +
                chalk.yellow(err.source) + ". File should be in " + chalk.yellow(err.path)
            message = "on module " + err.module + " required by " +
                err.source + ". File should be in " + err.path
            break

        case "out-of-scope":
            dmessage = "on file " + chalk.yellow(err.file)
            message = "on file " + err.file
            break

    }

    console.error(chalk.red.inverse(title) + (dmessage ? ": " + dmessage : ""))

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
        console.warn(chalk.green.inverse("DONE"))
    }
}

function watchCallback(args){
    return function(err, str){
        if (err) errorHandler(err, true)
    }
}

exports.errorHandler  = errorHandler
exports.write         = write
exports.upCallback    = upCallback
exports.watchCallback = watchCallback
