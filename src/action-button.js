// Action touches own only their pointer; a held movement finger stays active.
export function bindActionButton(button,{isEnabled,onActivate}) {
 let pointer=null;
 const controller=new AbortController();
 const listen=(type,handler,options={})=>button.addEventListener(type,handler,{...options,signal:controller.signal});
 const enabled=()=>!button.disabled&&!button.hidden&&isEnabled();
 const consume=event=>{event.preventDefault();event.stopPropagation();};
 function cancel(){
  const previous=pointer;pointer=null;
  if(previous&&button.hasPointerCapture?.(previous.id)){
   // The browser may already have released a pointer during page teardown.
   try{button.releasePointerCapture(previous.id);}catch{}
  }
 }
 function inside(event){
  const rect=button.getBoundingClientRect();
  return rect.right>rect.left&&rect.bottom>rect.top&&event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
 }
 listen('pointerdown',event=>{
  if(event.button!==0)return;
  consume(event);
  if(pointer||!enabled())return;
  pointer={id:event.pointerId,type:event.pointerType};
  try{button.setPointerCapture(event.pointerId);}catch{pointer=null;}
 });
 listen('pointerup',event=>{
  if(pointer?.id!==event.pointerId)return;
  consume(event);
  const previous=pointer;cancel();
  if(enabled()&&inside(event)){
   // pointerup.detail is zero; present a pointer activation rather than making
   // existing input classification mistake it for a keyboard/AT click.
   onActivate({pointerType:previous.type,pointerId:previous.id,detail:1,originalEvent:event});
  }
 });
 for(const type of ['pointercancel','lostpointercapture'])listen(type,event=>{
  if(pointer?.id!==event.pointerId)return;
  event.stopPropagation();cancel();
 });
 listen('click',event=>{
  consume(event);event.stopImmediatePropagation();
  // Swallow compatibility clicks even after cancellation. Native keyboard and
  // assistive activation has no pointer type and detail zero.
  if(event.detail===0&&!event.pointerType&&enabled())onActivate(event);
 },{capture:true});
 return {cancel,dispose(){cancel();controller.abort();}};
}
