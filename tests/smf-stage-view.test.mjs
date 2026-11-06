import test from 'node:test';import assert from 'node:assert/strict';import {registerHooks} from 'node:module';
import {createSMFStageView} from '../src/editions/smf-stage-view.js';import {SMF_PREVIEW_STAGES} from '../src/editions/smf-stages.js';import {getTiming} from '../src/stage-clock.js';
registerHooks({resolve(s,c,next){return s==='phaser'?{url:'test:venue-phaser',shortCircuit:true}:next(s,c)},load(url,c,next){return url==='test:venue-phaser'?{format:'module',source:'export default {Scene: class {}}',shortCircuit:true}:next(url,c)}});
const {StageRenderer}=await import('../src/StageRenderer.js');
function drawing(){const calls=[],nodes=[];const scene={children:{list:nodes},add:new Proxy({}, {get:(_,type)=>(...args)=>{let node;node=new Proxy({destroy(){this.dead=true}},{get(o,key){return key in o?o[key]:(...values)=>{calls.push([key,...values]);return node}}});calls.push([type,...args]);nodes.push(node);return node}})};return {scene,calls,nodes};}
for(const stage of SMF_PREVIEW_STAGES)test(`${stage.id} draws distinct owned scenery and freezes dynamic art under reduced motion`,()=>{
 const d=drawing(),before=structuredClone(stage),view=createSMFStageView(d.scene,stage);assert.equal(typeof view.update,'function');assert.ok(d.calls.length>40);assert.equal(createSMFStageView(d.scene,{id:'forest'}),null);
 const update=(time,reduced)=>{d.calls.length=0;view.update(time,'drop',reduced,getTiming(stage.timingId));return structuredClone(d.calls)};assert.deepEqual(update(0,true),update(30000,true));assert.notDeepEqual(update(1000,false),update(2000,false));assert.deepEqual(stage,before);
 const owned=drawing(),r=new StageRenderer(owned.scene,{venueView:createSMFStageView});r.show(stage);const old=[...owned.nodes];r.show(SMF_PREVIEW_STAGES.find(s=>s!==stage));assert.ok(old.every(n=>n.dead));r.destroy();assert.ok(owned.nodes.every(n=>n.dead));
});
test('venue scenery has different silhouettes and materials',()=>{const a=drawing(),b=drawing();createSMFStageView(a.scene,SMF_PREVIEW_STAGES[0]);createSMFStageView(b.scene,SMF_PREVIEW_STAGES[1]);assert.notDeepEqual(a.calls,b.calls);});
