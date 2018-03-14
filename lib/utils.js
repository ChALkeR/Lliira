'use strict';
const util = require('util');

function printShort(entry) {
  const round = 1e5;
  const data = { times: entry.times };
  for (const key of Object.keys(entry.scores)) {
    data[key] = Math.round(entry.scores[key] * round) / round;
  }
  console.log(util.inspect(data, { colors: true, breakLength: Infinity }).slice(2, -2));
}

function printFull(entry) {
  printShort(entry);
  // TODO: print tables
}

function *variants(size, length) {
  if (size < 1) return;
  if (size === 1) {
    for (let i = 0; i < length; i++) yield [i];
    return;
  }
  for (const prefix of variants(size - 1, length)) {
    const start = prefix[prefix.length - 1];
    for (let i = start; i < length; i++) {
      yield [...prefix, i];
    }
  }
}

module.exports = {
  printShort,
  printFull,
  variants
};
