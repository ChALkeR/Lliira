'use strict';

const { values, meetings, quorum, limits, slots } = require('../config.js');
const { prepare, analyze, utility } = require('./math.js');
const { variants } = require('./utils.js');

function bruteforceOne(data, size) {
  prepare(data, values, quorum);

  // If max reachable slots prob is above 0.5 then slots 5x below max will be
  // discarded. That is done just to save computation time and should not
  // affect the end results.
  const happensMax = Math.max(...data.happens);
  const happensMin = happensMax > 0.5 ? happensMax / 5 : 0;

  // Analyze each variant and store all them in memory for comparison
  const infos = [];
  for (const times of variants(size, data.nSlots)) {
    if (times.some(t => data.happens[t] < happensMin)) continue;
    const info = analyze(data, times, meetings, values, quorum);
    infos.push(info);
  }

  // Set of unique results we want to return
  const unique = new Set();
  const record = times => {
    // Use a canonical form for repeated single timeslot, e.g. [3,3,3] -> [3]
    const single = new Set(times).size === 1;
    unique.add(single ? `${times[0]}` : times.join(','));
  };

  // utility() optimization
  const bases = [1e-3, 1e-2, ...Array(20).fill(0).map((x, i) => (1 + i) * 0.05)];
  for (const type of ['participation', 'interaction']) {
    for (const base of bases) {
      const best = { score: 0 };
      for (const info of infos) {
        const score = utility(info.probs[type], base);
        if (score > best.score) {
          best.score = score;
          best.times = info.times;
        }
      }
      record(best.times);
    }
  }

  // linear combination of metrics optimization
  for (const type of ['participation', 'interaction']) {
    const step = 4e-2;
    for (let a = 0; a <= 1; a += step) {
      for (let b = 0; b <= 1 - a; b += step) {
        const c = 1 - a - b;
        const best = { score: 0 };
        for (const info of infos) {
          const metrics = info.scores[type];
          // avg and min are 0-1, stdev is 0-0.5, so multiply it by 2
          // higher avg and min is better, lower stdev is better
          const score = a * metrics.avg + b * metrics.min + (1 - c * metrics.stdev * 2);
          if (score > best.score) {
            best.score = score;
            best.times = info.times;
          }
        }
        record(best.times);
      }
    }
  }

  // Unwrap the unique resuts
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
