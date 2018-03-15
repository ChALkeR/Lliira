#!/usr/bin/env node

'use strict';

const { printShort } = require('./lib/utils.js');
const { bruteforce } = require('./lib/main.js');

for (const info of bruteforce(3)) {
  printShort(info);
}
