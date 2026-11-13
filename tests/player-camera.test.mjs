import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraFrame,createPlayerCamera} from '../src/player-camera.js';

const player={x:480,y:440};
function visible(frame){return {left:frame.x-frame.width/frame.zoom/2,right:frame.x+frame.width/frame.zoom/2,top:frame.y-frame.height/frame.zoom/2,bottom:frame.y+frame.height/frame.zoom/2};}
test('overview fits the complete fixed world in portrait and landscape',()=>{
 for(const [width,height] of [[390,620],[844,260],[960,640]]){
  const f=cameraFrame({width,height,mode:'overview',player,zoom:1.5}),v=visible(f);
  assert.ok(v.left<=.001&&v.right>=959.999&&v.top<=.001&&v.bottom>=639.999);
  assert.equal(f.x,480);assert.equal(f.y,320);
 }
});
test('automatic framing follows on mobile and preserves overview on desktop',()=>{
 assert.equal(cameraFrame({width:390,height:620,mode:'auto',isMobile:true,player}).mode,'follow');
 assert.equal(cameraFrame({width:844,height:260,mode:'auto',isMobile:true,player}).mode,'follow');
 assert.equal(cameraFrame({width:1200,height:720,mode:'auto',isMobile:false,player}).mode,'overview');
});
test('follow stays inside world edges when its viewport fits the world',()=>{
 for(const [width,height] of [[390,620],[844,260]])for(const p of [{x:0,y:0},{x:960,y:640},player]){
  const f=cameraFrame({width,height,mode:'follow',player:p}),v=visible(f);
  assert.ok(v.left>=-.001&&v.right<=960.001&&v.top>=-.001&&v.bottom<=640.001);
 }
});
test('zoom preferences are bounded and overview ignores close zoom',()=>{
 const base={width:390,height:620,mode:'follow',player};
 assert.equal(cameraFrame({...base,zoom:100}).zoom,cameraFrame({...base,zoom:1.5}).zoom);
 assert.equal(cameraFrame({...base,zoom:-1}).zoom,cameraFrame({...base,zoom:.8}).zoom);
 assert.equal(cameraFrame({...base,zoom:NaN}).zoom,cameraFrame(base).zoom);
 assert.equal(cameraFrame({...base,mode:'overview',zoom:1.5}).zoom,390/960);
});
test('putting focus fits a whole green with padding in both orientations',()=>{
 const focus={x:218,y:366,width:300,height:116};
 for(const [width,height] of [[390,620],[844,220]]){
  const f=cameraFrame({width,height,mode:'follow',player,focus}),v=visible(f);
  assert.ok(v.left<=focus.x-focus.width/2+.001&&v.right>=focus.x+focus.width/2-.001);
  assert.ok(v.top<=focus.y-focus.height/2+.001&&v.bottom>=focus.y+focus.height/2-.001);
  assert.equal(f.mode,'focus');
 }
});
function harness(){
 const camera={width:390,height:620,setSize(w,h){this.width=w;this.height=h;return this;},setZoom(v){this.zoom=v;return this;},centerOn(x,y){this.x=x;this.y=y;return this;}};
 const scene={cameras:{main:camera},game:{scale:{gameSize:{width:390,height:620}}},dancer:{...player},running:true,reducedMotion:false};
 return {scene,camera,controller:createPlayerCamera(scene,{mode:'follow'})};
}
test('camera smoothing is frame-rate independent and reduced motion follows directly',()=>{
 const a=harness(),b=harness();a.scene.dancer.x=650;b.scene.dancer.x=650;
 a.controller.update(40);for(let n=0;n<4;n++)b.controller.update(10);
 assert.ok(Math.abs(a.camera.x-b.camera.x)<1e-8);assert.ok(a.camera.x>480&&a.camera.x<650);
 a.scene.reducedMotion=true;a.controller.update(16);assert.equal(a.camera.x,650);
});
test('pause freezes camera follow; resize and focus still reframe safely',()=>{
 const {scene,camera,controller}=harness();scene.running=false;scene.dancer.x=600;controller.update(100);assert.equal(camera.x,480);
 controller.focus({x:218,y:366,width:300,height:116});assert.ok(camera.zoom>1);
 scene.game.scale.gameSize={width:844,height:220};controller.resize();assert.equal(camera.width,844);assert.equal(camera.height,220);
 assert.ok(Math.abs(camera.zoom-220/116)<1e-8);
 controller.focus(null);assert.equal(camera.zoom,844/960);assert.equal(camera.x,480);assert.equal(camera.y,440);
 controller.setOptions({mode:'overview',zoom:1.3});assert.equal(camera.x,480);assert.equal(camera.y,320);
});
test('reset recentres at a new stage spawn and dispose stops updates',()=>{
 const {scene,camera,controller}=harness();scene.dancer.x=650;controller.reset();assert.equal(camera.x,650);
 controller.dispose();scene.dancer.x=480;controller.update(100);controller.resize();assert.equal(camera.x,650);
});
