"use strict";

var prime    = require('prime')
var fs       = require("fs")
var path     = require("path")
var relative = require("require-relative");

var exists    = fs.existsSync || path.existsSync;
var isWindows = process.platform === "win32"
var pathsep   = path.sep || (isWindows ? '\\' : '/')

var nativeModuleRegex = isWindows ? /^([\w]:)/ : /^\//

function resolve(what, from){
    try {
        if (from) from = path.dirname(from)
        return relative.resolve(what, from)
    } catch (e){}
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

        var module = resolve(what, from)

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

        return prevpkgpath ? resolve(path.join(pkgpath, modulepath), from) : module
    }

})

module.exports = Resolver
