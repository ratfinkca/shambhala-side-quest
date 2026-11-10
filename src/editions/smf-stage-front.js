// A low physical apron joins the illustration to the bounded dancefloor. It
// stays below actors and needs no animation or additional texture allocation.
const MATERIALS={
 'smf-living-room':[0x493b2b,0xd7b78a],
 'smf-fractal':[0x213f3d,0x8acbb7],
 'smf-grove':[0x423e2d,0xc1b58a],
 'smf-amp':[0x343430,0xc3aa7d],
 'smf-pagoda':[0x383945,0xc6c1d9],
 'smf-village':[0x3d3029,0xd1b18c],
};
export function drawSMFStageFront(scene,stage){
 if(!stage.playBounds)return;
 const {minX,minY,maxX}=stage.playBounds,[wood,edge]=MATERIALS[stage.id];
 const g=scene.add.graphics().setDepth(.13);
 // Shadow is strongest at the lip; the floor stays open and unlabelled.
 for(let i=0;i<8;i++)g.fillStyle(0x061316,.025*(8-i)).fillRect(minX,minY+i*2,maxX-minX,2);
 g.fillStyle(wood,.9).fillPoints([{x:minX,y:minY-7},{x:maxX,y:minY-7},{x:maxX,y:minY},{x:minX,y:minY}],true);
 g.lineStyle(1.6,edge,.55).lineBetween(minX,minY-7,maxX,minY-7);
 g.lineStyle(2,0x0a181b,.85).lineBetween(minX,minY,maxX,minY);
 // Seams in the timber read as a stage edge rather than a UI divider.
 for(let x=minX+58;x<maxX;x+=116)g.lineStyle(1,0x0a171b,.5).lineBetween(x,minY-6,x-2,minY-1);
}
