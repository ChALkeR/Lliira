'use strict';

const { values, meetings, quorum } = require('../config.js');
const { data } = require('./data.js');
const { analyze, utility } = require('./math.js');
const { variants } = require('./utils.js');

function bruteforce(size) {
  const bases = [1e-3, 1e-2, ...Array(20).fill(0).map((x, i) => (1 + i) * 0.05)];
  const bests = {
    participation: bases.map(x => ({ score: 0, times: [] })),
    interaction:   bases.map(x => ({ score: 0, times: [] }))
  };
  for (const times of variants(size, data[0].length)) {
    const info = analyze(data, times, meetings, values, quorum);
    const base = 0.75;
    const score = utility(info.probs.interaction, base);
    for (const type of Object.keys(bests)) {
      const row = bests[type];
      for (let i = 0; i < row.length; i++) {
        const base = bases[i];
        const score = utility(info.probs[type], base);
        if (score > row[i].score) {
          row[i] = { score, times: info.times };
        }
      }
    }
  }
  const unique = new Set();
  for (const type of Object.keys(bests)) {
    for (const { times } of bests[type]) {
      unique.add(times.join(','));
    }
  }
  const results = [...unique].map(line => line.split(',').map(x => parseInt(x)));
  return results.map(times => analyze(data, times, meetings, values, quorum));
}

module.exports = { bruteforce };
