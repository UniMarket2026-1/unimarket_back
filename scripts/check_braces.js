const fs = require('fs');
const p = 'src/services/purchase-request.service.ts';
const s = fs.readFileSync(p, 'utf8').split(/\r?\n/);
let balance = 0;
for (let i = 0; i < s.length; i++) {
  for (const ch of s[i]) {
    if (ch === '{') balance++;
    else if (ch === '}') balance--;
  }
  if (i >= 0 && i < s.length) {
    if (balance !== 0) console.log((i + 1).toString().padStart(4, ' ') + ': ' + s[i] + '  // balance=' + balance);
    else console.log((i + 1).toString().padStart(4, ' ') + ': ' + s[i]);
  }
}
console.log('FINAL balance=' + balance);
