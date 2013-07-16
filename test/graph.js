"use strict";

var fs     = require('fs')
var assert = require('assert')
var passed = require('./run').passed

var wrup = require('../lib/main')({
    graph: true
})

wrup.require(__dirname + '/fixtures/b').up(function(err, actual){
    assert.ifError(err)
    var should = fs.readFileSync(__dirname + '/output/graph.dot')
    assert.equal(should, actual, "the generated dot should be equal")
    passed("graph")
})
