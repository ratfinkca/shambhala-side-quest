import test from 'node:test';
import assert from 'node:assert/strict';
import {createAvatar,setOutfit,animateAvatar} from '../src/Avatar.js';
import {createSouvenirView} from '../src/smf-tour/cosmetic-view.js';
import {createPuttingReward} from '../src/bonus-practice/putting-reward.js';
import {playerAvatarAnchors} from '../src/pixel-art/player-anchors.js';

function harness(){
 const nodes=[],scene={textures:{exists:()=>false}};
 const display=()=>{
  let n;const value={scene,active:true,visible:true,x:0,y:0,depth:0,scaleX:1,scaleY:1,alpha:1,list:[],rects:[],parent:null,pixelActor:false,pixelExternalCarry:false,pixelTextureReady:false,pixelBodyKey:null,
   clear(){this.rects=[];return n;},fillStyle(colour){this.colour=colour;return n;},fillRect(x,y,w,h){this.rects.push({x,y,w,h,colour:this.colour});return n;},
   setVisible(visible){this.visible=visible;return n;},setPosition(x,y){this.x=x;this.y=y;return n;},setDepth(depth){this.depth=depth;return n;},
   setScale(x,y=x){this.scaleX=x;this.scaleY=y;return n;},setAlpha(alpha){this.alpha=alpha;return n;},
   add(items){for(const item of Array.isArray(items)?items:[items]){this.list.push(item);item.parent=this;}return n;},
   destroy(){this.active=false;this.scene=null;this.list.forEach(item=>item.destroy());},
  };
  n=new Proxy(value,{get:(target,key)=>key in target?target[key]:(...args)=>n});nodes.push(n);return n;
 };
 scene.add={container:display,graphics:display,image:display};scene.dancer=display().setPosition(450,320).setDepth(20);
 scene.avatar=createAvatar(scene,{onesie:'lime',hat:'bucket',totem:'star',flair:'none'},{skinTone:'deep'});scene.avatar.setPosition(3,-2);
 return {scene,nodes};
}
const shown=node=>node.visible&&(!node.parent||shown(node.parent));
const staffProps=nodes=>nodes.filter(n=>['chicken','lantern-on','toast'].includes(n.pixelProp));

test('earned staffs replace the wardrobe staff temporarily and share its actual carry palm',()=>{
 const {scene,nodes}=harness(),saved={...scene.avatar.outfit};scene.souvenirView=createSouvenirView(scene);
 for(const [id,kind]of [['lantern-totem','lantern-on'],['cheese-totem','toast'],['golden-chicken','chicken']]){
  scene.souvenirView.update(id,100,true);
  assert.equal(scene.avatar.pixelExternalCarry,true);assert.deepEqual(scene.avatar.outfit,saved);assert.deepEqual(scene.avatar.totem.rects,[]);
  const active=staffProps(nodes).filter(shown);assert.equal(active.length,1);assert.equal(active[0].pixelProp,kind);
  const anchors=playerAvatarAnchors(scene),x=Math.round(anchors.hand.x),y=Math.round(anchors.hand.y),prop=active[0],pole=prop.parent.list[0];
  assert.deepEqual({x:prop.parent.x,y:prop.parent.y},{x:450,y:320});
  assert.ok(pole.rects.some(r=>r.x===x&&r.w===1&&r.y<=y&&r.y+r.h>y));assert.equal(prop.x,x);
  assert.ok(prop.propSize<=27,'earned icon uses the same compact scale as wardrobe totems');
 }
 scene.souvenirView.update('none',100,true);assert.equal(scene.avatar.pixelExternalCarry,false);assert.deepEqual(scene.avatar.outfit,saved);
 assert.ok(scene.avatar.totem.rects.length>0);assert.equal(staffProps(nodes).filter(shown).length,0);
});

test('upward-facing earned staff sits behind the body while its grip remains visible',()=>{
 const {scene,nodes}=harness();scene.souvenirView=createSouvenirView(scene);scene.souvenirView.update('lantern-totem');
 scene.avatar.pixelPose={row:4,index:2,carrying:true,poseMirror:true};scene.souvenirView.update('lantern-totem',200,true);
 const prop=staffProps(nodes).find(n=>n.pixelProp==='lantern-on');assert.ok(prop.parent.depth<scene.dancer.depth);
 assert.ok(nodes.some(n=>n.visible&&n.depth>scene.dancer.depth&&n.x===scene.dancer.x&&n.rects.some(r=>r.colour===0x925e47)),'deep-skin closing hand in foreground');
});

test('putting celebration shows one prize and does not compete with the equipped souvenir',()=>{
 const {scene,nodes}=harness();scene.souvenirView=createSouvenirView(scene);const practicePrize=createPuttingReward(scene);
 scene.config={activity:'putt'};scene.practice={state:{complete:true}};
 practicePrize.update(scene.dancer,300,true,true);scene.souvenirView.update('cheese-totem',300,true);
 const active=staffProps(nodes).filter(shown);assert.equal(active.length,1);assert.equal(active[0].pixelProp,'chicken');assert.equal(scene.avatar.pixelExternalCarry,true);
 scene.practice.state.complete=false;practicePrize.update(scene.dancer,300,true,false);scene.souvenirView.update('cheese-totem',300,true);
 assert.deepEqual(staffProps(nodes).filter(shown).map(n=>n.pixelProp),['toast']);assert.equal(scene.avatar.pixelExternalCarry,true);
});

test('the first putting-prize frame attaches to the new carry pose before the Tour paints souvenirs',()=>{
 const {scene,nodes}=harness();setOutfit(scene.avatar,{...scene.avatar.outfit,totem:'none'});
 Object.assign(scene.avatar.pixelMotion,{facing:'right',speed:300,gait:0});animateAvatar(scene.avatar,100,true);
 scene.souvenirView=createSouvenirView(scene);const practicePrize=createPuttingReward(scene);
 scene.config={activity:'putt'};scene.practice={state:{complete:true}};
 practicePrize.update(scene.dancer,100,true,true);scene.souvenirView.update(null,100,true);
 const prop=staffProps(nodes).find(shown);
 assert.equal(prop.x,Math.round(playerAvatarAnchors(scene).hand.x),'prize and held palm agree on the first visible frame');
});

test('standalone putting fallback can show, hide and destroy its prize without an avatar',()=>{
 const {scene,nodes}=harness();delete scene.avatar;const reward=createPuttingReward(scene);
 assert.doesNotThrow(()=>reward.update(scene.dancer,500,true,true));assert.equal(staffProps(nodes).filter(shown).length,1);
 reward.update(scene.dancer,600,true,false);assert.equal(staffProps(nodes).filter(shown).length,0);assert.doesNotThrow(()=>reward.destroy());
});

test('earned prop, closing hand and head ornament inherit preview scale and opacity together',()=>{
 const {scene,nodes}=harness();scene.dancer.setScale(3).setAlpha(.6);scene.avatar.setAlpha(.5);scene.souvenirView=createSouvenirView(scene);
 scene.souvenirView.update('golden-chicken',100,true);
 const prop=staffProps(nodes).find(shown),grip=nodes.find(n=>n.visible&&n.depth===20.2);
 for(const n of [prop.parent,grip]){assert.equal(n.scaleX,3);assert.equal(n.scaleY,3);assert.equal(n.alpha,.3);}
 scene.souvenirView.update('rabbit-ears',100,true);
 const blossom=nodes.find(n=>n.pixelProp==='blossom'),headLayer=blossom.parent;
 assert.equal(headLayer.scaleX,3);assert.equal(headLayer.scaleY,3);assert.equal(headLayer.alpha,.3);
 scene.avatar.setVisible(false);scene.souvenirView.update('golden-chicken',100,true);
 assert.equal(headLayer.visible,false);assert.equal(staffProps(nodes).filter(shown).length,0);assert.equal(grip.visible,false);
});

test('rabbit ears sit on the measured cap with compact mirrored profile shapes',()=>{
 const {scene,nodes}=harness();scene.souvenirView=createSouvenirView(scene);
 const blossom=nodes.find(n=>n.pixelProp==='blossom'),ears=blossom.parent.list[0];
 scene.avatar.pixelPose={row:8,index:0,facingFlipX:false};scene.souvenirView.update('rabbit-ears',0,true);
 const right=ears.rects.map(r=>({...r})),rightFit=playerAvatarAnchors(scene).headwear;
 assert.ok(right.some(r=>r.y===Math.round(rightFit.y)-2&&r.h===3),'headband overlaps the cap opening');
 assert.ok(right.every(r=>r.y>=Math.round(rightFit.y)-17&&r.h<=14),'ears stay within the compact silhouette');
 scene.avatar.pixelPose={row:8,index:0,facingFlipX:true};scene.souvenirView.update('rabbit-ears',0,true);
 const leftFit=playerAvatarAnchors(scene).headwear;
 ears.rects.forEach((r,i)=>assert.equal(r.x-Math.round(leftFit.x),-(right[i].x-Math.round(rightFit.x))-r.w,'profile decoration mirrors about its head socket'));
 scene.avatar.pixelPose={row:4,index:0};scene.souvenirView.update('rabbit-ears',0,true);
 assert.ok(ears.rects.every(r=>r.colour!==0xe79db6),'pink inside faces away when looking upward');
});

test('glow blossom attaches to the measured hair crown and narrows in profile',()=>{
 const {scene,nodes}=harness();scene.souvenirView=createSouvenirView(scene);const blossom=nodes.find(n=>n.pixelProp==='blossom');
 for(const pose of [{row:0,index:0},{row:2,index:2},{row:8,index:0,facingFlipX:true}]){
  scene.avatar.pixelPose=pose;scene.souvenirView.update('glow-blossom',0,true);const fit=playerAvatarAnchors(scene).headwear;
  assert.equal(blossom.y,Math.round(fit.crown.y+4));assert.equal(blossom.scaleX,fit.side?.8:1);assert.equal(blossom.propSize,17);
 }
});
