"use strict";

var assert = require('assert')
var fs     = require('fs')
var wrapup = require('../lib/main')
var test   = require('./run')

var wrup = wrapup({
    output: __dirname + "/output/compress.result.js",
    compress: true
})

wrup.require(__dirname + "/fixtures/up").up(function(err){
    assert.ifError(err)

    fs.stat(__dirname + "/output/compress.result.js", function(err, stat){
        assert.ifError(err)
        assert.ok(stat.size < 600) // up.result.js is ~400 bytes
        assert.ok(stat.size > 100)
        test.passed('compress')
    })

})
