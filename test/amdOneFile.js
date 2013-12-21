"use strict";

var assert = require('assert')
var wrapup = require('../lib/main')
var util   = require('../lib/util')
var test   = require('./run').test

var wrup = wrapup({
    amdOneFile: true,
    output: __dirname + "/output/amdOneFile.result.js"
})

util.getAST('amdOneFile-wrapper')(function(err, wrapper){

    if (err) throw err

    wrapper = util.clone(wrapper)

    wrup.require(__dirname + '/fixtures/up').up(function(err){
        assert.ifError(err)
        test('amdOneFile', null, function(should){
            wrapper.body.push.apply(wrapper.body, should.body)
            return wrapper
        })
    })

})

