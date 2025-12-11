const fs = require('fs');
const path = require('path');
function findBad(){
  const files = [];
  function walk(d){
    for(const f of fs.readdirSync(d)){
      const p = path.join(d,f);
      if(fs.statSync(p).isDirectory()) walk(p);
      else if(p.endsWith('.ts')){
        const s = fs.readFileSync(p,'utf8');
        if(s.includes(' undefined;')) files.push(p);
      }
    }
  }
  walk('src');
  return files;
}

const bad = findBad();
if(bad.length === 0){
  console.log('No bad files');
  process.exit(0);
}

for(const srcPath of bad){
  const rel = path.relative('src', srcPath);
  const distPath = path.join('dist','src', rel.replace(/\.ts$/, '.js'));
  if(!fs.existsSync(distPath)){
    console.error('No dist for', srcPath);
    continue;
  }
  const dist = fs.readFileSync(distPath,'utf8');
  const imports = dist.split('\n').filter(l => l.trim().startsWith('import '));
  const newImports = imports.join('\n');
  const srcContent = fs.readFileSync(srcPath,'utf8');
  const lines = srcContent.split('\n');
  let idx = 0;
  while(idx < lines.length && (lines[idx].trim().startsWith('import') || lines[idx].trim() === '')) idx++;
  const rest = lines.slice(idx).join('\n');
  const fixed = newImports + '\n\n' + rest;
  fs.writeFileSync(srcPath, fixed);
  console.log('Fixed', srcPath);
}
