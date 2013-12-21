"use strict";

var prime  = require('prime')
var fs     = require("fs")
var path   = require("path")
//@* i love sebmarkbage
var Module = require("module")

var exists    = fs.existsSync || path.existsSync;
var isWindows = process.platform === "win32"
var pathsep   = path.sep || (isWindows ? '\\' : '/')

var nativeModuleRegex = isWindows ? /^([\w]:)/ : /^\//

//resolve module from cwd or relative to another module.
function nodeResolve(module, from){
    from = (from == null) ? path.join(process.cwd(), "wrup.js") : path.resolve(from)
    var m = new Module(from)
    m.filename = from
    m.paths = Module._nodeModulePaths(path.dirname(from))
    try {
        return Module._resolveFilename(module, m)
    } catch (err){}
    return null
}

function findJSON(file){
    var dirname = file
    while (dirname = path.dirname(dirname)){
        var json = path.join(dirname, "package.json")
        if (exists(json)) return json
        if (dirname === "/" || isWindows && dirname.match(/^[\w]:\\$/)) break
    }
    return null
}

var Resolver = prime({

    // this makes sure we always use the same directory for a specified package
    // (the first it encounters) this might not be ideal, but duplicating
    // packages for the web is even worse
    resolve: function(what, from){

        var module = nodeResolve(what, from)

        if (!module) return null // cannot find module
        if (!module.match(nativeModuleRegex)) return true // native require

        var jsonpath = findJSON(module)
        if (!jsonpath) return module // not part of any package

        var pkgpath = path.dirname(jsonpath) + pathsep
        var modulepath = module.replace(pkgpath, "")

        var json = require(jsonpath)
        var id = json.name + "@" + json.version
        var prevpkgpath = (this.packages || (this.packages = {}))[id]
        pkgpath = prevpkgpath || (this.packages[id] = pkgpath)

        return prevpkgpath ? nodeResolve(path.join(pkgpath, modulepath), from) : module
    }

})

module.exports = Resolver
