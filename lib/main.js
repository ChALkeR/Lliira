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
    if (times.length > 1) {
      times.sort();
      // Use a canonical form for repeated timeslots
      // e.g. [3,3,3] -> [3], [3,3,6,6] -> [3,6]
      const set = new Set(times);
      const coef = times.length / set.size;
      if (coef > 0 && coef % 1 === 0) {
        const uniq = [...set];
        uniq.sort();
        if (uniq.every(x => times.filter(y => y === x).length === coef)) {
          times = uniq;
        }
      }
    }
    const key = times.join(',');
    if (unique.has(key)) return false;
    unique.add(key);
    return true;
  };

  // Exponent
  const len = Math.max(...infos.map(info =>
    Math.max(...Object.values(info.scores).map(typed => typed.scores.length))
  ));
  const exponentFind = base => {
    const baseV = Array(len).fill().map((x, i) => base ** i);
    for (const type of ['participation', 'interaction']) {
      const best = { score: 0 };
      for (const info of infos) {
        const { vector } = info.scores[type];
        const score = vector.reduce((a, c, i) => a + c * baseV[i], 0);
        if (score > best.score) {
          best.score = score;
          best.times = info.times;
        }
      }
      record(best.times);
    }
  };
  for (const base of [2, 1.05, 1 + 1e-5, 1]) exponentFind(base);
  const step = 1.03;
  const steps = Math.ceil(Math.log(1.5) / Math.log(step));
  for (let base = step ** steps; base >= 1; base /= step) {
    exponentFind(base);
  }

  // .u05 optimization
  for (const type of ['participation', 'interaction']) {
    const best = { u05: '' };
    for (const info of infos) {
      const u05 = info.scores[type].u05;
      if (u05 > best.u05) {
        best.u05 = u05;
        best.times = info.times;
      }
    }
    if (best.times) {
      record(best.times);
    }
  }

  // utility() optimization
  const bestUtil = (type, base) => {
    const best = { score: 0 };
    for (const info of infos) {
      const score = utility(info.probs[type], base);
      if (score > best.score) {
        best.score = score;
        best.times = info.times;
      }
    }
    return best;
  };
  for (const type of ['participation', 'interaction']) {
    const bests = new Map();
    for (const base of [0, 1e-4, 1e-3, 1]) {
      bests.set(base, bestUtil(type, base));
    }
    const eps = 5e-2;
    const queue = [[0, 1]];
    while (queue.length > 0) {
      const [a, b] = queue.shift();
      if ((b - a) < eps) continue;
      const mid = (a + b) / 2;
      const best = bestUtil(type, mid);
      bests.set(mid, best);
      if (`${best.times}` !== `${bests.get(a).times}`) {
        queue.push([a, mid]);
      }
      if (`${best.times}` !== `${bests.get(b).times}`) {
        queue.push([mid, b]);
      }
    }
    for (const [, best] of bests) {
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
