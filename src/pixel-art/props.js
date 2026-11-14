import {pixelizeGraphics,pixelLantern,pixelSandwich,pixelStar} from './shapes.js';

const SOURCE='sidequest-party-props-v1',ASSET_URL=new URL('./assets/party-props-v1.png',import.meta.url).href;
export const PIXEL_PROPS=['candy-0','candy-1','candy-2','candy-3','toast','sandwich','lantern-off','lantern-on','seed','blossom','chicken','golf-ball'];
let pending;
function source(){
 if(typeof Image==='undefined')return Promise.resolve(null);
 return pending??=new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{pending=null;resolve(null);};image.src=ASSET_URL;});
}
function ensureTexture(scene,image){
 if(!image||!scene.textures?.addImage)return null;
 if(!scene.textures.exists(SOURCE)){
  const texture=scene.textures.addImage(SOURCE,image);texture.setFilter?.(1);
  PIXEL_PROPS.forEach((kind,index)=>texture.add(kind,0,index%4*362,Math.floor(index/4)*362,362,362));
 }
 return SOURCE;
}
function fallback(g,kind,size){
 g.clear();g.setScale(size/40);
 if(kind.startsWith('candy-')){
  const index=Number(kind.slice(-1)),color=[0xf49ec7,0x85dcca,0xd3b0ff,0xffcc83][index];
  g.fillStyle(0x30233e).fillRect(-12,-10,24,20).fillRect(-20,-7,8,14).fillRect(12,-7,8,14);
  g.fillStyle(color).fillRect(-10,-8,20,16).fillRect(-18,-5,5,10).fillRect(13,-5,5,10);
  g.fillStyle(0xfff5de).fillRect(-9,-8,15,2);
  if(index===1)pixelStar(g,0,1,1.5,0xffdb67);
  else for(let i=-6;i<=6;i+=6)g.fillStyle(0xfff5de).fillRect(i,-4,3,index===2?3:8);
 }else if(kind==='lantern-on'||kind==='lantern-off')pixelLantern(g,0,0,{lit:kind==='lantern-on'});
 else if(kind==='sandwich'||kind==='toast')pixelSandwich(g,0,0,1.1);
 else if(kind==='seed'){g.fillStyle(0xd28d40).fillEllipse(0,3,20,27);g.fillStyle(0xffdc80).fillEllipse(-3,1,8,21);g.lineStyle(3,0xafbf73).lineBetween(0,-11,0,-18).lineBetween(0,-11,7,-16);}
 else if(kind==='blossom'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;g.fillStyle(0xf0a0c9).fillCircle(Math.cos(a)*10,Math.sin(a)*10,7);}g.fillStyle(0xffdc80).fillRect(-3,-3,6,6);}
 else if(kind==='chicken'){g.fillStyle(0xffd678).fillEllipse(0,3,28,18).fillCircle(12,-9,7);g.fillStyle(0xf49758).fillRect(8,-19,9,5).fillRect(18,-10,6,4);g.fillStyle(0x392b3b).fillRect(13,-11,2,3);g.fillStyle(0xdba344).fillRect(-9,12,18,5);}
 else {g.fillStyle(0xffffff).fillCircle(0,0,13);g.fillStyle(0x9fcad1).fillRect(-5,-3,3,3).fillRect(3,2,3,3);}
}

export function setPixelProp(node,kind){
 if(!PIXEL_PROPS.includes(kind))throw new Error(`Unknown pixel prop: ${kind}`);
 node.pixelProp=kind;fallback(node.propFallback,kind,node.propSize);node.propSprite?.setFrame(kind);return node;
}
// Generated sprites are presentation only; gameplay coordinates remain on the
// owning container. A source failure leaves a readable native pixel fallback.
export function createPixelProp(scene,kind,{size=40}={}){
 const node=scene.add.container(0,0),art=pixelizeGraphics(scene.add.graphics());node.add(art);
 node.propSize=size;node.propFallback=art;node.propSprite=null;setPixelProp(node,kind);
 source().then(image=>{
  if(!node.scene||node.active===false)return;
  const key=ensureTexture(scene,image);if(!key||!scene.add.image)return;
  const sprite=scene.add.image(0,0,key,node.pixelProp).setOrigin(.5).setScale(size/362);
  node.add(sprite);node.propSprite=sprite;art.setVisible(false);
 });
 return node;
}
