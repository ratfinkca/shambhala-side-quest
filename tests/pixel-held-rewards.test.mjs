import test from 'node:test';
import assert from 'node:assert/strict';
import {createAvatar,setOutfit,animateAvatar} from '../src/Avatar.js';
import {createSouvenirView} from '../src/smf-tour/cosmetic-view.js';
import {createPuttingReward} from '../src/bonus-practice/putting-reward.js';
import {playerAvatarAnchors} from '../src/pixel-art/player-anchors.js';

function harness(){
 const nodes=[],scene={textures:{exists:()=>false}};
 const display=()=>{
  let n;const value={scene,active:true,visible:true,x:0,y:0,depth:0,scaleX:1,scaleY:1,alpha:1,list:[],rects:[],parent:null,destroyed:0,pixelActor:false,pixelExternalCarry:false,pixelTextureReady:false,pixelBodyKey:null,
   clear(){this.rects=[];return n;},fillStyle(colour,alpha=1){this.colour=colour;this.fillAlpha=alpha;return n;},fillRect(x,y,w,h){this.rects.push({x,y,w,h,colour:this.colour,alpha:this.fillAlpha});return n;},
   setVisible(visible){this.visible=visible;return n;},setPosition(x,y){this.x=x;this.y=y;return n;},setDepth(depth){this.depth=depth;return n;},
   setScale(x,y=x){this.scaleX=x;this.scaleY=y;return n;},setAlpha(alpha){this.alpha=alpha;return n;},
   add(items){for(const item of Array.isArray(items)?items:[items]){this.list.push(item);item.parent=this;}return n;},
   destroy(){this.destroyed++;this.active=false;this.scene=null;this.list.forEach(item=>item.destroy());},
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

test('Prism Crown follows the measured head band across front, back and mirrored side poses',()=>{
 const {scene,nodes}=harness(),saved=structuredClone(scene.avatar.outfit);
 scene.souvenirView=createSouvenirView(scene);
 const crown=nodes.find(n=>n.pixelProp==='blossom').parent.list[0];
 for(const pose of [{row:0,index:0},{row:2,index:2},{row:4,index:0},{row:8,index:0,facingFlipX:false},{row:8,index:0,facingFlipX:true}]){
  scene.avatar.pixelPose=pose;scene.souvenirView.update('prism-crown',0,true);
  const fit=playerAvatarAnchors(scene).headwear,cx=Math.round(fit.x),base=Math.round(fit.y);
  assert.ok(crown.rects.some(r=>r.y===base-2&&r.h===3&&r.x<cx&&r.x+r.w>cx),'crown band overlaps the measured cap opening');
  assert.ok(crown.rects.every(r=>r.y>=base-12&&r.y+r.h<=base+1),'crown stays compact above the head');
  for(const colour of [0x78e8dd,0xed8bce,0xffca79])assert.ok(crown.rects.some(r=>r.colour===colour),'each face retains its crystal colour');
  assert.deepEqual(scene.avatar.outfit,saved,'edition souvenir leaves generic wardrobe and aura selection intact');
  assert.equal(scene.avatar.pixelExternalCarry,false);
 }
 scene.avatar.pixelPose={row:8,index:0,facingFlipX:false};scene.souvenirView.update('prism-crown',0,true);
 const right=crown.rects.map(r=>({...r})),rx=Math.round(playerAvatarAnchors(scene).headwear.x);
 scene.avatar.pixelPose={row:8,index:0,facingFlipX:true};scene.souvenirView.update('prism-crown',0,true);
 const lx=Math.round(playerAvatarAnchors(scene).headwear.x);
 crown.rects.forEach((r,i)=>assert.equal(r.x-lx,-(right[i].x-rx)-r.w,'left crystal profile mirrors around its own head socket'));
});

test('Prism Crown chases only tiny crystal highlights and stays still in reduced motion',()=>{
 const {scene,nodes}=harness();scene.souvenirView=createSouvenirView(scene);
 const crown=nodes.find(n=>n.pixelProp==='blossom').parent.list[0];
 scene.souvenirView.update('prism-crown',0,false);const first=structuredClone(crown.rects);
 scene.souvenirView.update('prism-crown',450,false);const next=structuredClone(crown.rects);
 assert.ok(first.length>0);assert.notDeepEqual(next,first,'normal motion chases the crystal highlights');
 assert.deepEqual(next.filter(r=>r.colour!==0xf2f8e0),first.filter(r=>r.colour!==0xf2f8e0),'band and crystals never flash or move');
 assert.ok(next.filter(r=>r.colour===0xf2f8e0).every(r=>r.w*r.h<=2),'animated area is a tiny glint');
 scene.souvenirView.update('prism-crown',0,true);const still=structuredClone(crown.rects);
 scene.souvenirView.update('prism-crown',19000,true);assert.deepEqual(crown.rects,still);
 scene.souvenirView.update(null,20000,false);assert.deepEqual(crown.rects,[],'unequipping clears the crown');
});

test('Prism Crown inherits player visibility and disposal prevents later drawing',()=>{
 const {scene,nodes}=harness();scene.dancer.setScale(2).setAlpha(.6);scene.avatar.setAlpha(.5);
 scene.souvenirView=createSouvenirView(scene);const head=nodes.find(n=>n.pixelProp==='blossom').parent,crown=head.list[0];
 scene.souvenirView.update('prism-crown',100,true);
 assert.ok(crown.rects.length>0);assert.equal(head.scaleX,2);assert.equal(head.alpha,.3);assert.equal(head.depth,23);
 scene.avatar.setVisible(false);scene.souvenirView.update('prism-crown',200,false);assert.equal(head.visible,false);
 scene.souvenirView.destroy();scene.souvenirView.destroy();
 assert.equal(head.destroyed,1);assert.equal(crown.destroyed,1);
 scene.avatar.setVisible(true);scene.souvenirView.update('prism-crown',300,false);
 assert.deepEqual(crown.rects,[],'disposed head ornament does not draw after teardown');
});
