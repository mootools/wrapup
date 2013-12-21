"use strict";

var expect = require('expect.js')
var path = require('path')
var through = require('through')

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
            expect(module.dependencies.length).to.be(2)
            expect(module.requires.length).to.be(2)
            done()
        })
    })

    it('should put "null" in module.dependencies if the dependency cannot be resolved', function(done){
        createScanner().scan('./a', fixtures + '/b', function(err, module){
            if (err) return done(err)
            expect(module.dependencies.length).to.be(2)
            expect(module.dependencies[0]).to.be(null)
            expect(module.dependencies[1]).to.be(null)
            done()
        })
    })

    it('should put the module object in module.dependencies if the dependency can be resolved', function(done){
        createScanner().scan('./d', fixtures + '/b', function(err, module){
            if (err) return done(err)
            expect(module.dependencies.length).to.be(1)
            expect(module.dependencies[0].full).to.be(path.normalize(fixtures + '/e.js'))
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

    it('should fill the dependents array', function(done){
        createScanner().scan('./d', fixtures + '/b', function(err, module){
            if (err) return done(err)
            expect(module.full).to.equal(path.normalize(fixtures + '/d.js'))
            expect(module.dependencies[0].dependents.length).to.be(1)
            expect(module.dependencies[0].dependents[0] == module).to.be.ok()
            done()
        })
    })

    it('should find the paths of the requires in the AST object', function(done){
        createScanner().scan('./up', fixtures + '/b', function(err, module){
            if (err) return done(err)
            var requires = module.requires.map(function(req){
                return {path: req.path, argument: req.argument}
            })
            expect(requires).to.eql([
                {argument: './e',   path: 'body.0.expression'},
                {argument: './up1', path: 'body.1.declarations.0.init.object'},
                {argument: './up1', path: 'body.2.declarations.0.init.callee'},
                {argument: './up1', path: 'body.3.declarations.0.init'},
                {argument: './up1', path: 'body.4.declarations.0.init.properties.0.value'},
                {argument: './e',   path: 'body.5.declarations.0.init.left'},
                {argument: './e',   path: 'body.5.declarations.0.init.right'},
                {argument: './up1', path: 'body.6.expression.right.callee'}
            ])
            done()
        })
    })

    describe('rescan', function(){

        var getMap  = function(storage){
            return storage.keys().map(function(file){
                var mod = storage.get(file)
                return {uid: mod.uid, full: file}
            })
        }

        it('should not change the result after a second scan', function(done){
            var storage = new Storage()
            var scanner = new Scanner(new Resolver(), storage)
            scanner.scan('./d', fixtures + '/b', function(err, module){
                if (err) return done(err)
                var map = getMap(storage)
                scanner.scan('./d', fixtures + '/b', function(err, module){
                    var map2 = getMap(storage)
                    expect(map).to.eql(map2)
                    done()
                })
            })
        })

        it('should not change the result after invalidating a result', function(done){
            var storage = new Storage()
            var scanner = new Scanner(new Resolver(), storage)
            scanner.scan('./d', fixtures + '/b', function(err, module){
                if (err) return done(err)
                var map = getMap(storage)
                storage.invalidate(path.normalize(fixtures + '/e.js'))
                scanner.scan('./e', fixtures + '/b', function(err, module){
                    var map2 = getMap(storage)
                    expect(map).to.eql(map2)
                    done()
                })
            })

        })

        it('should not change the result after removing a result', function(done){
            var storage = new Storage()
            var scanner = new Scanner(new Resolver(), storage)
            scanner.scan('./d', fixtures + '/b', function(err, module){
                if (err) return done(err)
                var map = getMap(storage)
                storage.remove(path.normalize(fixtures + '/e.js'))
                scanner.scan('./e', fixtures + '/b', function(err, module){
                    if (err) return done(err)
                    var map2 = getMap(storage)
                    expect(map).to.eql(map2)
                    done()
                })
            })
        })

    })

    describe('transform pre (src)', function(){
        it('should transform some source code with a src transform', function(done){
            var scanner = createScanner()
            scanner.addTransform({
                src: function(module, callback){
                    module.src = module.src.replace("'e'", "'d'")
                    callback(null, module)
                }
            })
            scanner.scan('./e', fixtures + '/a', function(err, module){
                expect(module.src).to.eql("module.exports = 'd'\n")
                done()
            })
        })
    })

    describe('transform (browserify)', function(){
        it('should transform some source code with a src transform', function(done){
            var scanner = createScanner()
            scanner.addTransform(function(file){
                var data = '';
                return through(function write(buf){
                    data += buf
                }, function end(){
                    this.queue(data.replace("'e'", "'d'"))
                    this.queue(null)
                })
            })
            scanner.scan('./e', fixtures + '/a', function(err, module){
                expect(module.src).to.eql("module.exports = 'd'\n")
                done()
            })
        })
    })

    describe('transform post (ast)', function(){
        it('should transform the AST of a module', function(done){
            var scanner = createScanner()
            scanner.addTransform({
                ast: function(module, callback){
                    module.ast.body[0].expression.right.value = 'd'
                    callback(null, module)
                }
            })
            scanner.scan('./e', fixtures + '/a', function(err, module){
                expect(module.ast.body[0].expression.right.value).to.eql('d')
                done()
            })
        })
    })

})
