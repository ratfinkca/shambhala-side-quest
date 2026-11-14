import {pixelStar,pixelHeart,pixelEllipse} from './shapes.js';

const SOURCE='sidequest-party-fx-v1',ASSET_URL=new URL('./assets/party-fx-v1.png',import.meta.url).href;
const ROWS={spark:0,flow:1,friend:2,bass:3},DEFAULT_SCALE={spark:.65,flow:1,friend:.65,bass:1};
let imagePromise;
function image(){
 if(typeof Image==='undefined')return Promise.resolve(null);
 return imagePromise??=new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{imagePromise=null;resolve(null);};img.src=ASSET_URL;});
}
function ensureTexture(scene,img){
 if(!img||!scene.textures?.addImage)return null;
 if(!scene.textures.exists(SOURCE)){
  const texture=scene.textures.addImage(SOURCE,img);
  texture.setFilter?.(1); // Phaser NEAREST: hard pixel edges at any game zoom.
  for(const [kind,row]of Object.entries(ROWS))for(let i=0;i<4;i++){
   const x=Math.round(i*1254/4),right=Math.round((i+1)*1254/4),y=Math.round(row*1254/4),bottom=Math.round((row+1)*1254/4);
   texture.add(`${kind}-${i}`,0,x,y,right-x,bottom-y);
  }
 }
 return SOURCE;
}
function fallback(g,kind){
 g.clear();
 if(kind==='spark')pixelStar(g,0,0,2,0xffdf8b);
 else if(kind==='flow'){
  g.fillStyle(0x95632f).fillPoints([{x:0,y:-21},{x:16,y:0},{x:0,y:21},{x:-16,y:0}],true);
  g.fillStyle(0xffd36a).fillPoints([{x:0,y:-17},{x:12,y:0},{x:0,y:17},{x:-12,y:0}],true);
  g.fillStyle(0xfff1b5).fillRect(-2,-13,3,25);
 }else if(kind==='friend')pixelHeart(g,0,0,2.5);
 else g.lineStyle(2,0x95ffe0,.85).strokePoints(pixelEllipse(0,0,43,17),true);
}
// A visual container only. Root scenes keep the same pickup positions/radii.
export function createPixelPickup(scene,kind,{scale=1}={}){
 if(!(kind in ROWS))throw new Error(`Unknown pixel pickup: ${kind}`);
 const node=scene.add.container(0,0),art=scene.add.graphics();node.add(art);
 node.pixelKind=kind;node.pixelFallback=art;node.pixelScale=scale;node.pixelFrame=0;node.pixelSprite=null;
 fallback(art,kind);art.setScale?.(scale);
 image().then(img=>{
  if(!node.scene||!node.active||!scene.sys?.isActive?.()&&!scene.sys?.isSleeping?.()&&!scene.game)return;
  const texture=ensureTexture(scene,img);if(!texture||!scene.add.sprite)return;
  const sprite=scene.add.sprite(0,0,texture,`${kind}-${node.pixelFrame}`).setOrigin(.5).setScale(64/(1254/4)*(DEFAULT_SCALE[kind]??1)*scale);
  node.add(sprite);node.pixelSprite=sprite;art.setVisible(false);
 });
 return node;
}
export function updatePixelPickup(node,elapsed=0,reduced=false){
 if(typeof node?.pixelKind!=='string'||!(node.pixelKind in ROWS))return;
 const index=reduced?0:Math.floor(Math.max(0,elapsed)*6/1000)%4;
 node.pixelFrame=index;node.pixelSprite?.setFrame(`${node.pixelKind}-${index}`);
}
