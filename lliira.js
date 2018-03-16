#!/usr/bin/env node

'use strict';

const { loadFile } = require('./lib/data.js');
const { printShort } = require('./lib/utils.js');
const { bruteforce } = require('./lib/main.js');

const data = loadFile(process.argv[2] || 'data.tsv');

for (const info of bruteforce(data)) {
  printShort(info);
}
