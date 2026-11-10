import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {readdir,readFile,access,mkdtemp,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {assetsForEdition} from '../build/edition-assets.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?files(resolve(dir,e.name)):resolve(dir,e.name)))).flat();}
function build(id,out){return spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',out,'--emptyOutDir'],{cwd:root,env:{...process.env,VITE_EDITION:id},encoding:'utf8'});}
// Verification owns only this temporary root, never the release artifact.
const scratch=await mkdtemp(resolve(tmpdir(),'sidequest-edition-check-'));
try{
for(const id of ['generic','smf']){
 const out=resolve(scratch,id),result=build(id,out);
 if(result.status!==0){throw new Error(result.stdout+result.stderr);}
 const paths=await files(out),allowed=assetsForEdition(id);
 for(const path of allowed)await access(resolve(out,path));
 for(const path of paths){
  const relative=path.slice(out.length+1);
  assert.doesNotMatch(relative,/rabbit-hole-v1|secret-garden-v1|ikigai-mori-v1|villagio-v1/,'Production includes bonus rehearsal artwork');
  if(!relative.startsWith('assets/')&&relative!=='index.html')assert.ok(allowed.includes(relative),`Unowned ${id} asset: ${relative}`);
  if(!/\.(css|html|js)$/.test(path))continue;
  const text=await readFile(path,'utf8');
  assert.doesNotMatch(text,/bonus-practice|bonus-select|Golden Chicken Totem|putting-controls|Souvenir unlocked:|Club tour complete!|amp-delivery-entry|Delivered 0 \/ 3|Cheese courier|clock-practice-entry|Timing and instrument practice|clock-lab-select|Sister cedars · river reflections|twin lanes · follow the returning pulse/,'Production includes development practice');
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
const invalid=build('invalid',resolve(scratch,'invalid'));assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/Unknown edition/);
console.log('Invalid edition rejected');

}finally{await rm(scratch,{recursive:true,force:true});}
