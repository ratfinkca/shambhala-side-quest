import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {collisionPracticeRequested,startEdition} from '../src/editions/registry.js';

test('collision practice requires explicit DEV SMF rehearsal and collision query flags',()=>{
 const cases=[
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal&collision',true],
  [{DEV:true,VITE_EDITION:'smf'},'?collision&rehearsal=1',true],
  [{DEV:true,VITE_EDITION:'smf'},'',false],
  [{DEV:true,VITE_EDITION:'smf'},'?collision',false],
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal',false],
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal&controls',false],
  [{DEV:false,VITE_EDITION:'smf'},'?rehearsal&collision',false],
  [{DEV:'true',VITE_EDITION:'smf'},'?rehearsal&collision',false],
  [{VITE_EDITION:'smf'},'?rehearsal&collision',false],
  [{DEV:true,VITE_EDITION:'generic'},'?rehearsal&collision',false],
  [{DEV:false,VITE_EDITION:'generic'},'?rehearsal&collision',false],
  [{DEV:true},'?rehearsal&collision',false],
 ];
 for(const [env,search,expected] of cases)assert.equal(collisionPracticeRequested(env,search),expected,JSON.stringify({env,search}));
});

const entries=['collision','controls','bonus','backstage','venues','clock','tour','game','scaffold'];
async function selectedEntry(env,flags,omit=[]){
 const calls=[],actions=Object.fromEntries(entries.filter(entry=>!omit.includes(entry)).map(entry=>[entry,edition=>{calls.push({entry,edition:edition.id});return entry;}]));
 const selected=await startEdition(env,actions,flags);
 assert.deepEqual(calls,[{entry:selected,edition:env.VITE_EDITION??'generic'}],'exactly one entry must run');
 return selected;
}

test('forced collision flags cannot replace production or generic entrypoints',async()=>{
 for(const [env,expected] of [
  [{DEV:true,VITE_EDITION:'smf'},'collision'],
  [{DEV:false,VITE_EDITION:'smf'},'tour'],
  [{DEV:'true',VITE_EDITION:'smf'},'tour'],
  [{VITE_EDITION:'smf'},'tour'],
  [{DEV:true,VITE_EDITION:'generic'},'game'],
  [{DEV:false,VITE_EDITION:'generic'},'game'],
  [{DEV:true},'game'],
 ])assert.equal(await selectedEntry(env,{collisionPractice:true}),expected);
});

test('existing practice and normal routes remain unchanged when collision is not selected',async()=>{
 const env={DEV:true,VITE_EDITION:'smf'};
 for(const [flags,expected] of [
  [{},'tour'],[{controlPractice:true},'controls'],[{bonusPractice:true},'bonus'],
  [{backstagePractice:true},'backstage'],[{venuePractice:true},'venues'],[{clockPractice:true},'clock'],
  [{controlPractice:true,bonusPractice:true,backstagePractice:true,venuePractice:true,clockPractice:true},'controls'],
  [{bonusPractice:true,backstagePractice:true,venuePractice:true,clockPractice:true},'bonus'],
  [{backstagePractice:true,venuePractice:true,clockPractice:true},'backstage'],
  [{venuePractice:true,clockPractice:true},'venues'],
 ])assert.equal(await selectedEntry(env,flags),expected);
 assert.equal(await selectedEntry(env,{collisionPractice:true,controlPractice:true},['collision']),'controls');
 assert.equal(await selectedEntry(env,{collisionPractice:true},['collision']),'tour');
 assert.equal(await selectedEntry(env,{collisionPractice:true,controlPractice:true}),'collision');
});

test('the real application entry imports only the selected route and leaves collision disabled outside DEV SMF',async t=>{
 // Exercise main.js routing itself. Only replace browser-only entry modules
 // and CSS; the real registry and URL parsing run with each build environment.
 const mainURL=new URL('../src/main.js',import.meta.url).href;
 const oldWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
 const oldSelections=Object.getOwnPropertyDescriptor(globalThis,'__collisionRouteSelections');
 let environment={},caseId=0;
 const hook=registerHooks({
  resolve(specifier,context,next){
   if(context.parentURL?.startsWith(mainURL)){
    if(specifier.endsWith('.css'))return {url:`test:collision-routing/css/${caseId}/${encodeURIComponent(specifier)}`,shortCircuit:true};
    const selected=({'./collision-practice-entry.js':'collision','./control-practice-entry.js':'controls','./clock-practice-entry.js':'clock','./amp-delivery-entry.js':'backstage','./bonus-practice/entry.js':'bonus','./smf-tour/entry.js':'tour','./game-entry.js':'game'})[specifier];
    if(selected)return {url:`test:collision-routing/entry/${caseId}/${selected}`,shortCircuit:true};
   }
   return next(specifier,context);
  },
  load(url,context,next){
   if(url.startsWith('test:collision-routing/')){
    const source=url.includes('/entry/')?`globalThis.__collisionRouteSelections.push(${JSON.stringify(url.split('/').at(-1))});`:'';
    return {format:'module',source,shortCircuit:true};
   }
   const result=next(url,context);
   if(url.startsWith(mainURL))return {...result,source:String(result.source).replaceAll('import.meta.env',JSON.stringify(environment))};
   return result;
  },
 });
 t.after(()=>{
  hook.deregister();
  for(const [key,descriptor] of [['window',oldWindow],['__collisionRouteSelections',oldSelections]]){
   if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
  }
 });
 for(const [env,search,expected] of [
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal&collision','collision'],
  [{DEV:false,VITE_EDITION:'smf'},'?rehearsal&collision','tour'],
  [{DEV:true,VITE_EDITION:'generic'},'?rehearsal&collision','game'],
  [{DEV:false,VITE_EDITION:'generic'},'?rehearsal&collision','game'],
  [{DEV:true,VITE_EDITION:'smf'},'?collision','tour'],
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal&controls','controls'],
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal&clock','clock'],
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal&venues','clock'],
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal&backstage=amp','backstage'],
  [{DEV:true,VITE_EDITION:'smf'},'?rehearsal&bonus=villagio','bonus'],
 ]){
  environment=env;globalThis.window={location:{search}};globalThis.__collisionRouteSelections=[];
  await import(`${mainURL}?collision-route-test=${++caseId}`);
  assert.deepEqual(globalThis.__collisionRouteSelections,[expected],JSON.stringify({env,search}));
 }
});
