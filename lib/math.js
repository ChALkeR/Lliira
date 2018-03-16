'use strict';

function total(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function flatten(row, base) {
  // First, correct the values using `base` factor
  // Value #i in the array is divided by pow(base, i)
  // This is a faster impl of the following logic:
  // const corrected = row.map((x, i) => x * Math.pow(base, i));
  const corrected = row.slice();
  if (base !== 1) {
    let coef = 1;
    for (let i = 0; i < corrected.length; i++) {
      corrected[i] *= coef;
      coef *= base;
    }
  }
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
  const limit = table.length * flatten(table[0].slice().fill(1), base);
  return total(utils) / limit;
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
 * Compute population standard deviation
 */
function pstdev(arr) {
  const average = total(arr) / arr.length;
  const squareDeltas = arr.map(x => x - average).map(x => x * x);
  return Math.sqrt(total(squareDeltas) / squareDeltas.length);
}

/*
 * This is essentially a standard deviation of the expected avg meeting number
 * Ranging from 0 to 0.5, lower is better
 */
function deviation(table) {
  // Compute average percentage visited per person
  const scores = table.map(row => total(row) / row.length);
  return pstdev(scores);
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

function participationTable(data, times, meetings, happened) {
  const { probabilites } = data;
  const probs = new Array(probabilites.length);
  for (let k = 0; k < meetings; k++) {
    const t = times[k % times.length];
    const h = data.happens[t];
    for (let i = 0; i < probabilites.length; i++) {
      const p = h * probabilites[i][t];
      if (!probs[i]) probs[i] = [];
      addEvent(probs[i], p);
    }
  }
  return probs;
}

function interactionTable(data, times, meetings, happened) {
  const { probabilites } = data;
  const probs = [];
  for (let k = 0; k < meetings; k++) {
    const t = times[k % times.length];
    const h = data.happens[t];
    let o = 0;
    for (let i = 0; i < probabilites.length; i++) {
      for (let j = i + 1; j < probabilites.length; j++) {
        const p = h * probabilites[i][t] * probabilites[j][t];
        if (!probs[o]) probs.push([]);
        addEvent(probs[o], p);
        o++;
      }
    }
  }
  return probs;
}

function tableParams(table) {
  return {
    avg: utility(table, 1),
    min: Math.min(...table.map(total)) / table[0].length,
    stdev: deviation(table),
    fair: fairness(table),
  }
}

function prepare(data, values, quorum) {
  if (!data.probabilites) {
    // Convert raw data table to table of actual probabilities
    data.probabilites = data.values.map(row => row.map(x => values[x]));
  }

  if (!data.happens) {
    // Compute an array of meeting reaching quorum probabilites
    data.happens = [];
    for (let t = 0; t < data.nSlots; t++) {
      // Use a column of probabilites and compute the chance of reaching quorum
      const column = data.probabilites.map(row => row[t]);
      data.happens[t] = happens(column, quorum);
    }
  }
}

function analyze(data, times, meetings, values, quorum) {
  prepare(data, values, quorum);

  const info = {
    count: times.length,
    times,
    probs: {
      participation: participationTable(data, times, meetings),
      interaction: interactionTable(data, times, meetings)
    }
  };
  info.scores = {
    participation: tableParams(info.probs.participation),
    interaction: tableParams(info.probs.interaction),
  };
  return info;
}

module.exports = {
  utility,
  happens,
  participationTable,
  interactionTable,
  prepare,
  analyze
};
