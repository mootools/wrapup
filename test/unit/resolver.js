"use strict";

var path = require('path')
var expect = require('expect.js')

var Resolver = require('../../lib/resolver')

describe('Resolver', function(){

    it('should resolve a source file', function(){
        var resolver = new Resolver()
        var resolved = resolver.resolve('./a', __dirname + '/../fixtures/b')
        expect(resolved).to.equal(path.normalize(__dirname + '/../fixtures/a.js'))
    })

    it('should return "true" for a native require', function(){
        var resolver = new Resolver()
        var resolved = resolver.resolve('fs')
        expect(resolved).to.be(true)
    })

    it('should not require a package from node_modules', function(){
        var resolver = new Resolver()
        var resolved = resolver.resolve('json-a', __dirname + '/../fixtures/f/g')
        expect(resolved).to.equal(path.normalize(__dirname + '/../fixtures/f/node_modules/json-a/index.js'))
    })

    it('should not require the same library/version twice', function(){
        var resolver = new Resolver()
        var resolved1 = resolver.resolve('json-a', __dirname + '/../fixtures/f/g')
        var resolved2 = resolver.resolve('json-a', __dirname + '/../fixtures/f/node_modules/a/index')
        var modulePath = path.normalize(__dirname + '/../fixtures/f/node_modules/json-a/index.js')
        expect(resolved1).to.equal(modulePath)
        expect(resolved2).to.equal(modulePath)
    })

    it('should require a different file if the package version is different', function(){
        var resolver = new Resolver()
        var resolved1 = resolver.resolve('json-a', __dirname + '/../fixtures/f/g')
        var resolved2 = resolver.resolve('json-a', __dirname + '/../fixtures/f/node_modules/b/index')
        var modulePath1 = path.normalize(__dirname + '/../fixtures/f/node_modules/json-a/index.js')
        var modulePath2 = path.normalize(__dirname + '/../fixtures/f/node_modules/b/node_modules/json-a/index.js')
        expect(resolved1).to.equal(modulePath1)
        expect(resolved2).to.equal(modulePath2)
    })

})


