'use strict';

const { values, meetings, quorum } = require('../config.js');
const { data } = require('./data.js');
const { analyze, utility } = require('./math.js');
const { variants } = require('./utils.js');

function bruteforce(size) {
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
  for (const times of variants(size, data[0].length)) {
    const info = analyze(data, times, meetings, values, quorum);
    for (const type of ['participation', 'interaction']) {
      for (const base of bases) {
        const score = utility(info.probs[type], base);
        addBest([type, 'util', base], times, score);
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

module.exports = { bruteforce };
