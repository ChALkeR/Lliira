'use strict';

function loadFile(file) {
  const fs = require('fs');
  return loadTsv(fs.readFileSync(file, 'utf-8'));
}

function loadTsv(tsv) {
  const lines = tsv.trim().split('\n').map(r => r.split('\t'));
  return loadData(lines);
}

function loadData(lines) {
  if (lines.length < 1 || lines[0].length < 1 || !lines[0][0]) {
    throw new Error('Unexpected empty data file');
  }

  const haveNames = !/^[0-9]+$/.test(lines[0][0]);
  const values = [];
  const names = [];

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
    values.push(row.map(x => parseInt(x) || 0));
  }

  return { values, names };
}

module.exports = {
  loadFile,
  loadTsv,
  loadData,
};
