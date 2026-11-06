import test from 'node:test';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {readdir,readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {resolve} from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
async function inventory(dir,prefix=''){
 const records=[];
 for(const e of await readdir(dir,{withFileTypes:true})){
  const path=resolve(dir,e.name),key=prefix+e.name;
  if(e.isDirectory())records.push(...await inventory(path,key+'/'));
  else records.push([key,createHash('sha256').update(await readFile(path)).digest('hex')]);
 }
 return records.sort(([a],[b])=>a.localeCompare(b));
}
test('edition verification leaves the default generic release artifact untouched',async()=>{
 const build=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build'],{cwd:root,env:{...process.env,VITE_EDITION:'generic'},encoding:'utf8'});
 assert.equal(build.status,0,build.stderr);
 const before=await inventory(resolve(root,'dist'));assert.ok(!before.some(([p])=>p.endsWith('/title.webp')));
 const check=spawnSync(process.execPath,['scripts/check-edition-builds.mjs'],{cwd:root,encoding:'utf8'});assert.equal(check.status,0,check.stdout+check.stderr);
 assert.deepEqual(await inventory(resolve(root,'dist')),before,'The default dist must remain the generic-only artifact after edition verification');
});
