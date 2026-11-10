// Coordinates are normalized by canvas width on BOTH axes, keeping touch and
// mouse power identical through responsive sizing and the close-up camera.
export function attemptPuttingShot(practice,vector,cancelAim){
 const event=practice.shoot(vector);
 if(event)cancelAim();
 return event;
}

export function createPuttingGesture(){
 let origin=null,current=null;
 const valid=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 function vector(){
  if(!origin||!current)return null;
  const x=origin.x-current.x,y=origin.y-current.y,distance=Math.hypot(x,y);
  if(distance<.012)return null;
  const scale=Math.min(1,distance/.2)/distance;
  return {x:x*scale,y:y*scale};
 }
 function cancel(){origin=null;current=null;}
 return {
  get active(){return !!origin;},get vector(){return vector();},
  start(point,enabled){
   if(!enabled||origin||!valid(point)||point.primary===false||(point.button??0)!==0)return false;
   origin={...point};current={...point};return true;
  },
  move(point){if(origin&&point.id===origin.id&&valid(point))current={...point};},
  end(point,enabled){
   if(!origin||point?.id!==origin.id)return null;
   if(valid(point))current={...point};
   const shot=enabled&&point.inside!==false&&valid(point)?vector():null;
   cancel();return shot;
  },
  cancel,
 };
}
