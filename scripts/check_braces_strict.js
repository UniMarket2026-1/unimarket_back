const fs = require('fs');
const p = 'src/services/purchase-request.service.ts';
const s = fs.readFileSync(p, 'utf8').split(/\r?\n/);
let balance = 0;
let inSingle=false, inDouble=false, inBack=false, esc=false;
for(let i=0;i<s.length;i++){
  const line = s[i];
  for(let j=0;j<line.length;j++){
    const ch=line[j];
    if(esc){ esc=false; continue; }
    if(ch==='\\'){ esc=true; continue; }
    if(inSingle){ if(ch==="'") inSingle=false; continue; }
    if(inDouble){ if(ch==='"') inDouble=false; continue; }
    if(inBack){ if(ch==='`') inBack=false; continue; }
    if(ch==="'") { inSingle=true; continue; }
    if(ch==='"') { inDouble=true; continue; }
    if(ch==='`') { inBack=true; continue; }
    if(ch==='{') balance++;
    else if(ch==='}') balance--;
  }
  console.log((i+1).toString().padStart(4,' ')+': balance='+balance+' | '+line);
}
console.log('FINAL balance='+balance);
