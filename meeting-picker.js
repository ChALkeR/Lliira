const { printShort } = require('./lib/utils.js');
const { bruteforce } = require('./lib/main.js');

for (let size = 1; size <= 3; size++) {
  for (const info of bruteforce(size)) {
    printShort(info);
  }
}
