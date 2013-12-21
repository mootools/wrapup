"use strict";

var exec   = require('child_process').exec
var assert = require('assert')
var prime  = require('prime')
var forOwn = require('prime/object/forOwn')
var async  = require('async')
var passed = require('./run').passed

var shouldExitWith = function(code){
    return function(callback, command){
        return function(err, stdout, stderr){
            assert.equal(err && err.code || 0, code,
                '"' + command + '" should exit with "' + code + '"')
            callback()
        }
    }
}

var commands = {
    // no modules required
    'browser -r ./test/fixtures/up': shouldExitWith(0),
    'browser -r ./test/fixtures/not-existing': shouldExitWith(1),
    // requires --output option
    'amd -r ./test/fixtures/up --output __amd': shouldExitWith(0),
    'amd -r ./test/fixtures/up': shouldExitWith(1)
}

var tasks = []

forOwn(commands, function(test, command){
    tasks.push(function(callback){
        exec('node ./bin/wrup.js ' + command, {cwd: __dirname + '/../'}, test(callback, command))
    })
})

async.parallel(tasks, function(){
    passed('wrup command line')
})
