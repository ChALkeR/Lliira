'use strict';

const { values, meetings, quorum, limits, slots } = require('../config.js');
const { analyze, utility } = require('./math.js');
const { variants } = require('./utils.js');

function bruteforceOne(data, size) {
  const bases = [1e-3, 1e-2, ...Array(20).fill(0).map((x, i) => (1 + i) * 0.05)];
  const bests = new Map();
  const addBest = (path, times, score) => {
    const key = path.join('/');
    if (!bests.has(key)) {
      bests.set(key, { score: 0, times: [] });
    }
    const best = bests.get(key);
    if (score > best.score) {
      best.score = score;
      best.times = times;
    }
  };
  for (const times of variants(size, data.values[0].length)) {
    const info = analyze(data, times, meetings, values, quorum);
    for (const type of ['participation', 'interaction']) {
      for (const base of bases) {
        const score = utility(info.probs[type], base);
        addBest([type, 'util', base], times, score);
      }
    }
    const step = 5e-2;
    for (let a = 0; a <= 1; a += step) {
      for (let b = 0; b <= 1 - a; b += step) {
        const c = 1 - a - b;
        for (const type of ['participation', 'interaction']) {
          const metrics = info.scores[type];
          // avg and min are 0-1, stdev is 0-0.5, so multiply it by 2
          // higher avg and min is better, lower stdev is better
          const score = a * metrics.avg + b * metrics.min + (1 - c * metrics.stdev * 2);
          addBest([type, 'weighted', a, b, c], times, score);
        }
      }
    }
  }
  const unique = new Set();
  for (const [key, value] of bests) {
    // Use a canonical form for repeated single timeslot, e.g. [3,3,3] -> [3]
    const single = new Set(value.times).size === 1;
    unique.add(single ? `${value.times[0]}` : value.times.join(','));
  }
  const results = [...unique].map(line => line.split(',').map(x => parseInt(x)));
  return results.map(times => analyze(data, times, meetings, values, quorum));
}

function *bruteforce(data, maxSize = slots) {
  const had = new Set();
  let max = { participation: 0, interaction: 0 };
  for (let size = 1; size <= maxSize; size++) {
    const block = bruteforceOne(data, size);
    if (size === 1) {
      for (const info of block) {
        for (const type of ['participation', 'interaction']) {
          if (max[type] < info.scores[type].avg) {
            max[type] = info.scores[type].avg;
          }
        }
      }
    }
    for (const info of block) {
      const key = info.times.join(',');
      if (had.has(key)) continue;
      had.add(key);
      if (['participation', 'interaction'].some(type =>
        info.scores[type].avg < max[type] * limits[type]
      )) continue;
      yield info;
    }
  }
}

module.exports = { bruteforce };
