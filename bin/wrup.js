#!/usr/bin/env node
"use strict";

var program = require('./cli')

program.parse(process.argv)
if (!program.args.length) program.help()
