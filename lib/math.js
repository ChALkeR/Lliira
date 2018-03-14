'use strict';

function total(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function flatten(row, base) {
  // First, correct the values using `base` factor
  // Value #i in the array is divided by pow(base, i)
  const corrected = row.map((x, i) => x * Math.pow(base, i));
  // Return the sum of the corrected values
  return total(corrected);
}

/*
 * Append an event with probabilty `p` to a set of equivalent events
 *
 * @param {array} probs - probabilites [i: Pi] of observing >= i events.
 * @param {number} p - probability of the new event.
 */

function addEvent(probs, p) {
  probs.push(0);
  for (let i = probs.length - 1; i >= 0; i--) {
    const pre = (i > 0) ? probs[i - 1] : 1;
    probs[i] += (pre - probs[i]) * p;
  }
}

/*
 * Return the overall utility of a table of rows of probabilites compared
 * to maximum possible value. 0-1
 *
 * The higher the base is, the less is the difference between n-th and 1-st
 * occurances. When base = 1, 1-st occurance of memeber A is treated as valuable
 * as 10-th occurance of member B (pure participation metrics).
 *
 * The lower the base is, the more valuable are having at least a small number
 * of occurances for each participant. When base is really small, 1-st occurance
 * of member A is treated significantly more valuable than 2-nd occurance of
 * member B (fairness).
 */

function utility(table, base) {
  const utils = table.map(row => flatten(row, base));
  const limit = table.map(row => flatten(row.slice().fill(1), base));
  return total(utils) / total(limit);
}

function fairness(table) {
  // A small enough base so that subsequent levels don't influence each other
  const base = 1e-3;
  // The `power` constant is used just for normalization of the visual
  // representation and does not influence the selection itself
  const power = 0.2;
  // Just a normalized utility with a small base
  return 1 - Math.pow(1 - utility(table, base), power);
}

/*
 * Determine the probability that a certail meeting reaches quorum.
 * 
 * @param {array} probs - Participation probabilites for each person, 0-1.
 * @param {number} quorum - A quorum that needs to be reached (>=), 0-1.
 * 
 * @return {number} The resulting probability to reach the quorum, 0-1.
 */

function happens(probs, quorum) {
  const row = [1];
  for (const p of probs) {
    addEvent(row, p);
  }
  return row[Math.ceil(quorum * probs.length)];
}

function happensColumn(data, col, values, quorum) {
  const column = [];
  for (let i = 0; i < data.length; i++) {
    column.push(values[data[i][col]]);
  }
  return happens(column, quorum);
}

function participationTable(data, times, meetings, values, quorum) {
  const probs = new Array(data.length);
  for (let k = 0; k < meetings; k++) {
    const t = times[k % times.length];
    const h = happensColumn(data, t, values, quorum);
    for (let i = 0; i < data.length; i++) {
      const p = h * values[data[i][t]];
      if (!probs[i]) probs[i] = [];
      addEvent(probs[i], p);
    }
  }
  return probs;
}

function interactionTable(data, times, meetings, values, quorum) {
  const probs = [];
  for (let k = 0; k < meetings; k++) {
    const t = times[k % times.length];
    const h = happensColumn(data, t, values, quorum);
    let o = 0;
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        const p = h * values[data[i][t]] * values[data[j][t]];
        if (!probs[o]) probs.push([]);
        addEvent(probs[o], p);
        o++;
      }
    }
  }
  return probs;
}

function analyze(data, times, meetings, values, quorum) {
  const info = {
    count: times.length,
    times,
    probs: {
      participation: participationTable(data, times, meetings, values, quorum),
      interaction: interactionTable(data, times, meetings, values, quorum)
    }
  };
  info.scores = {
    participation: utility(info.probs.participation, 1),
    participationFairness: fairness(info.probs.participation),
    interaction: utility(info.probs.interaction, 1),
    interactionFairness: fairness(info.probs.interaction)
  };
  return info;
}

module.exports = {
  utility,
  happens,
  participationTable,
  interactionTable,
  analyze
};
