const { printShort } = require('./lib/utils.js');
const { bruteforce } = require('./lib/main.js');

const had = new Set();
for (let size = 1; size <= 3; size++) {
  for (const info of bruteforce(size)) {
    const key = info.times.join(',');
    if (had.has(key)) continue;
    had.add(key);
    printShort(info);
  }
}
