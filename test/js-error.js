"use strict";

var assert = require('assert')
var wrapup = require('../lib/main')
var pass   = require('./run').passed
var errors = require('../lib/errors')

var jsError

var wrup = wrapup()

wrup.scanner.on("warn", function(err){
    jsError = err
})

wrup.require(__dirname + '/fixtures/js-error').up(function(err, js){
    setTimeout(function(){
        assert(jsError && jsError instanceof errors.JavaScriptError)
        pass('js-error')
    }, 5)
})
