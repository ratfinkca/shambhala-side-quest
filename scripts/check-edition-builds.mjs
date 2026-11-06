import {spawnSync} from 'node:child_process';
import {readdir,readFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {assetsForEdition} from '../build/edition-assets.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?files(resolve(dir,e.name)):resolve(dir,e.name)))).flat();}
function build(id,out){return spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',out],{cwd:root,env:{...process.env,VITE_EDITION:id},encoding:'utf8'});}
for(const id of ['generic','smf']){
 const out=resolve(root,'dist',id),result=build(id,out);
 if(result.status!==0){process.stderr.write(result.stdout+result.stderr);process.exit(1);}
 const paths=await files(out),allowed=assetsForEdition(id);
 for(const path of allowed)await access(resolve(out,path));
 for(const path of paths){
  const relative=path.slice(out.length+1);
  if(!relative.startsWith('assets/')&&relative!=='index.html')assert.ok(allowed.includes(relative),`Unowned ${id} asset: ${relative}`);
  if(!/\.(css|html|js)$/.test(path))continue;
  const text=await readFile(path,'utf8');
  if(id==='generic')assert.doesNotMatch(text,/themes\/(?:forest-freakout|moonlit-mycelium|neon-field-trip)\/title\.webp/,'Generic references SMF title art');
  if(/\.(css|html)$/.test(path)){
   for(const match of text.matchAll(/(?:src|href)=["']([^"']+)["']|url\(["']?([^\s)'";]+)["']?\)/g)){
    const url=match[1]||match[2];if(/^(?:data:|https?:|#)/.test(url))continue;
    await access(resolve(dirname(path),url.split(/[?#]/)[0]));
   }
  }
 }
 const html=await readFile(resolve(out,'index.html'),'utf8');assert.ok(html.includes(id==='generic'?'Festival Side Quest':'Shambhala Side Quest'));
 console.log(`${id}: build, asset allowlist and static references verified`);
}
const invalid=build('invalid','dist/invalid');assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/Unknown edition/);
console.log('Invalid edition rejected');
