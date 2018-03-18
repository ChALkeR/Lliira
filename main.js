const Lliira = require('lliira');
const lzstring = require('lz-string');
const CodeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript');

const input = document.querySelector('#code textarea');
const output = document.querySelector("#result textarea");

input.value = input.value.trim();

const editor = CodeMirror.fromTextArea(input, {
  lineNumbers: true
});
const printer = CodeMirror.fromTextArea(output, {
  mode: 'javascript',
  readOnly: true,
  lineWrapping: true,
  lineNumbers: false
});

// Result calculation logic

let timeout;

let value = '';
function execute() {
  clearTimeout(timeout);
  if (value === input.value) return;
  value = input.value;
  const data = Lliira.loadTsv(value);
  output.value = '';
  for (const info of Lliira.bruteforce(data)) {
    const entry = Lliira.formatShort(info)
      .replace(/, (participation|interaction)/g, '\n\t$1');
    output.value += entry + '\n';
  }
  printer.setValue(output.value);
}

function schedule(delay = 100) {
  clearTimeout(timeout);
  timeout = setTimeout(execute, delay);
}

input.addEventListener('change', schedule);
editor.on('change', function() {
  input.value = editor.getValue();
  saveHash();
  schedule();
});
schedule();

// Hash logic

let savedHash;

function saveHash() {
  const data = {
    t: input.value
  };
  const parts = [];
  for (const key of Object.keys(data)) {
    parts.push(`${key}:${lzstring.compressToBase64(data[key])}`);
  }
  savedHash = parts.join(';');
  document.location.hash = `#${savedHash}`;
}

function loadHash() {
  const hash = document.location.hash.slice(1);
  if (hash.length === 0 || hash === savedHash) return;
  savedHash = hash;
  const data = {};
  const parts = hash.split(';');
  for (const part of parts) {
    const [key, base64] = part.split(':');
    data[key] = lzstring.decompressFromBase64(base64);
  }
  input.value = data.t || '';
  editor.setValue(input.value);
}

window.addEventListener('hashchange', loadHash, false);
setTimeout(loadHash, 10);
