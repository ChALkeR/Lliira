const Lliira = require('lliira');
const CodeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript.js');

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

let timeout;
function schedule(delay = 100) {
  clearTimeout(timeout);
  timeout = setTimeout(execute, delay);
}

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

input.addEventListener('change', schedule);
editor.on('change', function() {
  input.value = editor.getValue();
  schedule();
});
schedule();
