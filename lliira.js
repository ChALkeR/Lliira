#!/usr/bin/env node

'use strict';

const {
  loadFile,
  printShort,
  bruteforce
} = require('./lib.js');

const data = loadFile(process.argv[2] || 'data.tsv');

for (const info of bruteforce(data)) {
  printShort(info);
}
