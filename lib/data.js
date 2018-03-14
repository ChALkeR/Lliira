const fs = require('fs');

const data = [];
const names = [];

const file = process.argv[2] || 'data.tsv';
const lines = fs.readFileSync(file, 'utf-8').trim().split('\n').map(r => r.split('\t'));

if (lines.length < 1 || lines[0].length < 1 || !lines[0][0]) {
  throw new Error('Unexpected empty data file');
}

const haveNames = !/^[0-9]+$/.test(lines[0][0]);

const rowLength = lines[0].length;
for (const row of lines) {
  if (row.length !== rowLength) {
    throw new Error('Inconsistent data file');
  }
  if (haveNames) {
    names.push(row.shift());
  } else {
    names.push(`#${names.length + 1}`);
  }
  data.push(row.map(x => parseInt(x) || 0));
}

module.exports = { data, names };
