const data = [];
const names = [];

function loadFile(file) {
  const fs = require('fs');

  data.length = names.length = 0;

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
}

module.exports = {
  data,
  names,
  loadFile,
};
