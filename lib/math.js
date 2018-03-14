'use strict';

function flatten(row, base) {
  // First, correct the values using `base` factor
  // Value #i in the array is divided by pow(base, i)
  const corrected = row.map((x, i) => x * Math.pow(base, i));
  // Return the sum of the corrected values
  return corrected.reduce((a, b) => a + b, 0);
}

/*
 * Return the overall utility of a table of rows of probabilites compared
 * to maximum possible value. 0-1
 */

function utility(table, base) {
  const utils = table.map(row => flatten(row, base));
  const limit = table.map(row => flatten(row.slice().fill(1), base));
  return utils.reduce((a, b) => a + b, 0) / limit.reduce((a, b) => a + b, 0);
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
    row.push(0);
    for (let j = row.length - 1; j >= 0; j--) {
      row[j] += (((j > 0) ? row[j - 1] : 1) - row[j]) * p;
    }
  }
  return row[Math.ceil(quorum * probs.length)];
}

module.exports = { utility, happens };
