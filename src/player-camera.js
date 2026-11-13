// Viewport framing only. Stage geometry, encounter distances and player speed
// remain in the same 960 × 640 world in both phone orientations.
const WORLD={width:960,height:640};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const positive=(value,fallback)=>Number.isFinite(value)&&value>0?value:fallback;
const validFocus=value=>value&&Number.isFinite(value.x)&&Number.isFinite(value.y)&&Number.isFinite(value.width)&&value.width>0&&Number.isFinite(value.height)&&value.height>0;
const modeValue=value=>['auto','follow','overview'].includes(value)?value:'auto';
const zoomValue=value=>Number.isFinite(value)?clamp(value,.8,1.5):1;
function boundCenter(value,visible,total){return visible>=total?total/2:clamp(value,visible/2,total-visible/2);}

export function cameraFrame({width=960,height=640,mode='auto',zoom=1,isMobile=false,player={x:480,y:320},focus=null}={}){
 width=positive(width,960);height=positive(height,640);mode=modeValue(mode);
 mode=validFocus(focus)?'focus':mode==='auto'?(isMobile?'follow':'overview'):mode;
 const fit=Math.min(width/WORLD.width,height/WORLD.height);
 const scale=mode==='focus'?Math.min(width/focus.width,height/focus.height):mode==='overview'?fit:Math.max(width/WORLD.width,height/WORLD.height)*zoomValue(zoom);
 const point=mode==='focus'?focus:mode==='overview'?{x:480,y:320}:player;
 const x=Number.isFinite(point?.x)?point.x:480,y=Number.isFinite(point?.y)?point.y:320;
 return {width,height,mode,zoom:scale,x:boundCenter(x,width/scale,WORLD.width),y:boundCenter(y,height/scale,WORLD.height)};
}

export function createPlayerCamera(scene,{mode='auto',zoom=1,isMobile=()=>false}={}){
 const camera=scene.cameras.main;
 let options={mode:modeValue(mode),zoom:zoomValue(zoom)},focus=null,last=null,disposed=false,dirty=true;
 function update(delta=0){
  if(disposed)return;
  const size=scene.game.scale?.gameSize||{width:camera.width,height:camera.height};
  const next=cameraFrame({...options,width:size.width,height:size.height,isMobile:typeof isMobile==='function'?isMobile():isMobile,player:scene.dancer,focus});
  const reframe=dirty||!last||next.width!==last.width||next.height!==last.height||next.zoom!==last.zoom||next.mode!==last.mode;
  if(!reframe&&!scene.running)return;
  if(!reframe&&next.mode==='follow'&&!scene.reducedMotion){
   const amount=1-Math.exp(-Math.max(0,Number.isFinite(delta)?delta:0)/125);
   next.x=last.x+(next.x-last.x)*amount;next.y=last.y+(next.y-last.y)*amount;
  }
  if(reframe)camera.setSize?.(next.width,next.height);
  camera.setZoom(next.zoom).centerOn(next.x,next.y);
  last=next;dirty=false;
 }
 function reset(){dirty=true;update();}
 const api={
  update,resize:reset,reset,
  setOptions(value={}){options={mode:modeValue(value.mode??options.mode),zoom:zoomValue(value.zoom??options.zoom)};reset();},
  focus(value){focus=validFocus(value)?{...value}:null;reset();},
  dispose(){disposed=true;},
 };
 reset();return api;
}
