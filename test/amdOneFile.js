"use strict";

var assert = require('assert')
var wrapup = require('../lib/main')
var test   = require('./run').test

var wrup = wrapup()

wrup.options({
    output: __dirname + "/output/amdOneFile.result.js"
})

wrup.on("error", function(err){
    assert.fail(err, undefined, "no errors should occur")
})

wrup.require(__dirname + '/fixtures/up').amdOneFile(function(err){
    assert.ifError(err)
    test('amdOneFile')
})
