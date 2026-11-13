export function phoneViewport(width,height){return width<=700||(width<=1000&&height<=500);}

export function playViewport(width,height){
 const w=Number.isFinite(width)&&width>0?Math.max(1,Math.floor(width)):960;
 const h=Number.isFinite(height)&&height>0?Math.max(1,Math.floor(height)):640;
 return {width:w,height:h,orientation:w>=h?'landscape':'portrait'};
}
// A browser toolbar/keyboard can change height without turning the device.
export function viewportRotated(previous,next){return !!previous&&previous.width!==next.width&&previous.orientation!==next.orientation;}

// Change the viewport, never the dimensions of the gameplay world. Ignore
// unchanged sizes so HUD updates cannot repeatedly cancel a held thumbstick.
export function resizeGameViewport(game,width,height,scene){
 const w=Math.max(1,Math.floor(width)),h=Math.max(1,Math.floor(height));
 if(!Number.isFinite(w)||!Number.isFinite(h))return false;
 const size=game.scale.gameSize;
 if(size.width===w&&size.height===h)return false;
 scene?.clearInput();scene?.puttingView?.cancelAim();
 game.scale.setGameSize(w,h);scene?.playerCamera?.resize();
 return true;
}
