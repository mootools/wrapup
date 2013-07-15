"use strict";

var expect = require('expect.js')
var path = require('path')

var Scanner = require('../../lib/scanner')
var Resolver = require('../../lib/resolver')
var Storage = require('../../lib/moduleStorage')

var fixtures = __dirname + '/../fixtures'

function createScanner(){
    return new Scanner(new Resolver(), new Storage())
}

describe('Scanner', function(){

    it('should scan a file and find the require() calls', function(done){
        createScanner().scan('./a', fixtures + '/b', function(err, module){
            if (err) return done(err)
            expect(module.full).to.equal(path.normalize(fixtures + '/a.js'))
            expect(module.src).to.be.ok()
            expect(module.deps.length).to.be(2)
            expect(module.requires.length).to.be(2)
            done()
        })
    })

    it('should put "null" in module.deps if the dependency cannot be resolved', function(done){
        createScanner().scan('./a', fixtures + '/b', function(err, module){
            if (err) return done(err)
            expect(module.deps.length).to.be(2)
            expect(module.deps[0]).to.be(null)
            expect(module.deps[1]).to.be(null)
            done()
        })
    })

    it('should put the module object in module.deps if the dependency can be resolved', function(done){
        createScanner().scan('./d', fixtures + '/b', function(err, module){
            if (err) return done(err)
            expect(module.deps.length).to.be(1)
            expect(module.deps[0].full).to.be(path.normalize(fixtures + '/e.js'))
            done()
        })
    })

    it('should recursively find requires', function(done){
        var storage = new Storage()
        var scanner = new Scanner(new Resolver(), storage)
        scanner.scan('./f/i', fixtures + '/b', function(err, module){
            if (err) return done(err)
            expect(storage.get(path.normalize(fixtures + '/f/i.js'))).to.be.ok()
            expect(storage.get(path.normalize(fixtures + '/f/index.js'))).to.be.ok()
            expect(storage.get(path.normalize(fixtures + '/f/g.js'))).to.be.ok()
            expect(storage.get(path.normalize(fixtures + '/h.js'))).to.be.ok()
            expect(storage.get(path.normalize(fixtures + '/e.js'))).to.be.ok()
            done()
        })

    })

})
