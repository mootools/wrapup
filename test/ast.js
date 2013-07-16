"use strict";

var assert = require('assert')
var fs     = require('fs')
var wrapup = require('../lib/main')
var test   = require('./run')
var diff   = require('ansidiff')

var wrup = wrapup({
    ast: true
})

wrup.require(__dirname + "/fixtures/up").up(function(err, actual){
    assert.ifError(err)
    var should = fs.readFileSync(__dirname + "/output/ast.json", "utf-8")
    fs.writeFileSync(__dirname + "/output/ast.result.json", actual)
    try {
        assert.equal(actual, should, "AST JSON structure should be equal")
    } catch (e){
        console.log(diff.words(should, actual));
        throw e;
    }
    test.passed('ast')
})

