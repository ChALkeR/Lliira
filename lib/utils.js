'use strict';
const util = require('util');

const round = 1e5;

function printShort(info) {
  const data = { times: info.times };
  for (const key of Object.keys(info.scores)) {
    data[key] = Math.round(info.scores[key] * round) / round;
  }
  console.log(util.inspect(data, {
    colors: true,
    breakLength: Infinity
  }).slice(2, -2));
}

function printParticipation(info, names) {
  const data = info.probs.participation;
  console.log(`Number of meetings,${data[0].map((x,i) => i + 1).join(',')}`);
  for (let i = 0; i < data.length; i++) {
    const vals = data[i].map(x => Math.round(x * 1e5) / 1e5);
    console.log(`${names[i]},${vals.join(',')}`);
  }
}

function printInteraction(info, names) {
  const data = info.probs.interaction;
  console.log(`Number of meetings,${data[0].map((x,i) => i + 1).join(',')}`);
  let o = 0;
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const vals = data[o++].map(x => Math.round(x * 1e5) / 1e5);
      console.log(`${names[i]}+${names[j]},${vals.join(',')}`);
    }
  }
  if (data.length !== o) throw new Error('Unexpected interaction table size');
}

function printFull(info, names) {
  console.log();
  console.log('Interaction:');
  printInteraction(info, names);
  console.log();
  console.log('Participation:');
  printParticipation(info, names);
  console.log();
  printShort(info);
  console.log();
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
