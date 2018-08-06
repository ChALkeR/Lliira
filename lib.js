'use strict';

const config = require('./config.js');

const {
  loadFile,
  loadTsv,
  loadData,
} = require('./lib/data.js');

const {
  prepare,
  analyze,
} = require('./lib/math.js');

const {
  formatShort,
  formatPretty,
  printShort,
  printPretty,
  printFull,
} = require('./lib/utils.js');

const {
  bruteforce,
} = require('./lib/main.js');


module.exports = {
  config,
  loadFile,
  loadTsv,
  loadData,
  prepare,
  analyze,
  formatShort,
  formatPretty,
  printShort,
  printPretty,
  printFull,
  bruteforce,
};
