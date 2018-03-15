'use strict';

const colors = {
  number: ['\u001b[33m', '\u001b[0m'], // yellow
  boolean: ['\u001b[33m', '\u001b[0m'], // yellow
  string: ['\u001b[32m', '\u001b[0m'], // green
};

const isTTY = typeof process !== 'undefined' && process.stdout && process.stdout.isTTY;
if (!isTTY) {
  // Unset all colors
  for (const key of Object.keys(colors)) {
    colors[key] = ['', ''];
  }
}

function format(arg, options = {}) {
  if (typeof arg === 'number') {
    return `${colors.number[0]}${arg}${colors.number[1]}`;
  } if (typeof arg === 'boolean') {
    return `${colors.boolean[0]}${arg}${colors.boolean[1]}`;
  } else if (typeof arg === 'string') {
    return `'${arg}'`;
  } else if (Array.isArray(arg)) {
    if (arg.length === 0) return '[]';
    return `[ ${arg.map(x => format(x, options)).join(', ')} ]`;
  } else if (typeof arg === 'object' && arg.constructor === Object) {
    const entries = Object.entries(arg);
    if (entries.length === 0) return {};
    return `{ ${entries.map(([k, v]) => `${k}: ${format(v, options)}`).join(', ')} }`;
  }
  return JSON.stringify(arg);
}

function printShort(info) {
  const data = { times: info.times };
  for (const key of Object.keys(info.scores)) {
    data[key] = {};
    for (const sub of Object.keys(info.scores[key])) {
      data[key][sub] = Math.round(info.scores[key][sub] * 1e4) / 1e4;
    }
  }
  console.log(format(data).slice(2, -2));
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
