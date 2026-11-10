import test from 'node:test';import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {assetsForEdition,editionAssetsPlugin} from '../build/edition-assets.js';
import {renderBrand} from '../src/editions/brand-view.js';
import {getEdition} from '../src/editions/registry.js';
test('edition asset allowlists exclude embedded SMF titles and unused concept boards',async()=>{
 const generic=assetsForEdition('generic'),smf=assetsForEdition('smf');assert.equal(new Set(generic).size,generic.length);assert.ok(smf.includes('smf-playtest-data.html'));assert.ok(!generic.includes('smf-playtest-data.html'));
 for(const id of ['forest-freakout','moonlit-mycelium','neon-field-trip']){
  assert.ok(!generic.includes(`themes/${id}/title.webp`));assert.ok(smf.includes(`themes/${id}/title.webp`));
  for(const asset of ['backdrop','boots','moth','noodle','bracelet'])assert.ok(generic.includes(`themes/${id}/${asset}.webp`));
 }
 assert.ok(!smf.some(p=>p.startsWith('themes/previews/')));assert.throws(()=>assetsForEdition('unknown'));
 for(const path of smf)await access(new URL('../public/'+path,import.meta.url));
});
test('generic brand uses a neutral backdrop and accessible text; SMF uses its owned title art',()=>{
 const generic=renderBrand(getEdition(),'moonlit-mycelium');assert.match(generic,/Festival Side Quest/);assert.match(generic,/backdrop.webp/);assert.doesNotMatch(generic,/title.webp|Shambhala/);
 const smf=renderBrand(getEdition('smf'),'moonlit-mycelium');assert.match(smf,/Shambhala Side Quest/);assert.match(smf,/moonlit-mycelium\/title.webp/);
});
test('DEV public middleware serves allowlisted files and refuses unowned title paths',async()=>{
 let handle;editionAssetsPlugin('generic').configureServer({middlewares:{use(fn){handle=fn}}});
 const request=async url=>{let status=200,body;await handle({url},{setHeader(){},set statusCode(v){status=v},end(v){body=v}},()=>{body='next'});return {status,body}};
 assert.equal((await request('/themes/forest-freakout/title.webp')).status,404);
 const allowed=await request('/themes/forest-freakout/backdrop.webp?v=1');assert.equal(allowed.status,200);assert.ok(Buffer.isBuffer(allowed.body));
 assert.equal((await request('/src/main.js')).body,'next');
});

test('all DEV public aliases enforce the same edition ownership',async()=>{
 const {fileURLToPath}=await import('node:url');
 let handle;editionAssetsPlugin('generic').configureServer({middlewares:{use(fn){handle=fn}}});
 const request=async url=>{let status=200,body;await handle({url},{setHeader(){},set statusCode(v){status=v},end(v){body=v}},()=>{body='next'});return {status,body}};
 const absolute=fileURLToPath(new URL('../public/themes/forest-freakout/title.webp',import.meta.url));
 for(const url of ['/public/themes/forest-freakout/title.webp','/@fs'+absolute,'/@fs/'+absolute])assert.equal((await request(url)).status,404,url);
});

test('actual Vite requests cannot retrieve another edition\'s public artwork',async()=>{
 const {createServer}=await import('vite');const {fileURLToPath}=await import('node:url');
 const server=await createServer({configFile:false,root:fileURLToPath(new URL('..',import.meta.url)),publicDir:false,plugins:[editionAssetsPlugin('generic')],server:{host:'127.0.0.1',port:0}});
 try{
  await server.listen();const origin=`http://127.0.0.1:${server.httpServer.address().port}`;
  const absolute=fileURLToPath(new URL('../public/themes/forest-freakout/title.webp',import.meta.url));
  for(const path of ['/themes/forest-freakout/title.webp','/public/themes/forest-freakout/title.webp','/@fs'+absolute,'/@fs/'+absolute])assert.equal((await fetch(origin+path)).status,404,path);
  for(const path of ['/themes/forest-freakout/backdrop.webp','/public/fonts/DMSans.ttf'])assert.equal((await fetch(origin+path)).status,200,path);
 }finally{await server.close();}
});
