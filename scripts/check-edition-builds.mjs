import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {readdir,readFile,access,mkdtemp,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {assetsForEdition} from '../build/edition-assets.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const venues=['living-room','fractal-forest','grove','amp','pagoda','village','rabbit-hole','secret-garden','ikigai-mori','villagio','prism-party'];
const venueArt=venues.flatMap(name=>[`${name}-v1`,`${name}-pixel-v1`]);
const practiceOnly=/Wardrobe fitting room|wardrobe-fit-stage|wardrobe-fit-lab|Pixel Afterparty|pixel-lab|pixel-raver|pixel-effects|collision-practice-entry|Meet the crowd|collision-lab|bonus-select|bonus-help-copy|amp-delivery-entry|clock-practice-entry|control-practice-entry|control-stamina|Find your moves|Timing and instrument practice|clock-lab-select|Tour integration lab|Collect invitation \(lab\)|Clear current stage \(lab\)|Souvenir unlocked:|Club tour complete!/;
function excludes(text,pattern,message){const match=text.match(pattern);assert.ok(!match,`${message}${match?`: ${match[0]}`:''}`);}
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?files(resolve(dir,e.name)):resolve(dir,e.name)))).flat();}
function build(id,out){return spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',out,'--emptyOutDir'],{cwd:root,env:{...process.env,VITE_EDITION:id},encoding:'utf8'});}
// Verification owns only this temporary root, never the release artifact.
const scratch=await mkdtemp(resolve(tmpdir(),'sidequest-edition-check-'));
try{
for(const id of ['generic','smf']){
 const out=resolve(scratch,id),result=build(id,out);
 if(result.status!==0){throw new Error(result.stdout+result.stderr);}
 const paths=await files(out),allowed=assetsForEdition(id);let shippedText='';
 for(const path of allowed)await access(resolve(out,path));
 for(const path of paths){
  const relative=path.slice(out.length+1);
  if(id==='generic')excludes(relative,/title-(?:forest-freakout|moonlit-mycelium|neon-field-trip)-v1/,'Generic includes SMF pixel title');
  if(id==='generic')for(const asset of venueArt)assert.ok(!relative.includes(asset),`Generic includes SMF venue art: ${relative}`);
  excludes(relative,/(?:pixel-lab|pixel-raver|pixel-effects|collision-practice-entry|clock-practice-entry|amp-delivery-entry|(?:^|\/)lab-)/,'Production includes development entry');
  if(!relative.startsWith('assets/')&&relative!=='index.html')assert.ok(allowed.includes(relative),`Unowned ${id} asset: ${relative}`);
  if(!/\.(css|html|js)$/.test(path))continue;
  const text=await readFile(path,'utf8');
  shippedText+=text;
  excludes(text,practiceOnly,'Production includes development practice');
  excludes(text,/prism-lab|prism-menu-button|prism-density|Fractal Forest · first feel preview/,'Production includes isolated Prism preview');
  if(id==='generic'){
   excludes(text,/themes\/(?:forest-freakout|moonlit-mycelium|neon-field-trip)\/title\.webp/,'Generic references SMF title art');
   excludes(text,/Prism Crown|All three faces lit|Golden Chicken Totem|tour-menu|tour-map-stop|SIX STAGES · SIX HIDDEN PARTIES|Sister cedars · river reflections|twin lanes · follow the returning pulse/,'Generic includes SMF tour gameplay');
   for(const asset of venueArt)assert.ok(!text.includes(asset),`Generic references SMF venue art: ${asset}`);
  }
  if(/\.(css|html)$/.test(path)){
   for(const match of text.matchAll(/(?:src|href)=["']([^"']+)["']|url\(["']?([^\s)'";]+)["']?\)/g)){
    const url=match[1]||match[2];if(/^(?:data:|https?:|#)/.test(url))continue;
    await access(resolve(dirname(path),url.split(/[?#]/)[0]));
   }
  }
 }
 if(id==='smf'){
  assert.ok(shippedText.includes('SIX HIDDEN PARTIES'),'SMF tour entry missing from production');
  for(const venue of venues)assert.ok(paths.some(path=>path.includes(`${venue}-pixel-v1`)&&path.endsWith('.webp')),`SMF lossless pixel tour art missing: ${venue}`);
  for(const theme of ['forest-freakout','moonlit-mycelium','neon-field-trip'])assert.ok(paths.some(path=>path.includes(`title-${theme}-v1`)&&path.endsWith('.webp')),`SMF lossless pixel title missing: ${theme}`);
  for(const path of paths)assert.ok(!/(?:-pixel-v1|title-(?:forest-freakout|moonlit-mycelium|neon-field-trip)-v1)[^/]*\.png$/.test(path),'PNG artwork masters must not ship alongside lossless delivery files');
 }
 const html=await readFile(resolve(out,'index.html'),'utf8');assert.ok(html.includes(id==='generic'?'Festival Side Quest':'Shambhala Side Quest'));
 console.log(`${id}: build, asset allowlist and static references verified`);
}
const invalid=build('invalid',resolve(scratch,'invalid'));assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/Unknown edition/);
console.log('Invalid edition rejected');

}finally{await rm(scratch,{recursive:true,force:true});}
