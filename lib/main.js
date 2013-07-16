"use strict";
// this exports a "masked" factory function of the WrapUp "class"

var WrapUp = require("./wrapup")
var Browser = require("./output/browser")

module.exports = function(options){
	if (!options) options = {}
	var wrapup = new WrapUp()
	var browser = new Browser()
	wrapup.withOutput(browser)
	browser.set('output', options.output)
	return wrapup
}
