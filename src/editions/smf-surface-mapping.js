// Original projection artwork mapped into fixed measured venue surfaces.
// Every vertex is interpolated inside its quadrilateral: no render masks,
// textures, display objects or physical movement of the stage are required.
const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const PALETTES={timber:[0x57f3cf,0xd17bff,0xffc478],facade:[0x04f5df,0xe619ed,0xff8031],canopy:[0x5cf3ce,0xf185e8,0xc6a0ff]};
const valid=panel=>Array.isArray(panel)&&panel.length===4&&panel.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
function colourAt(palette,phase){
 const cycle=((phase/TAU)%1+1)%1*palette.length,index=Math.floor(cycle),t=cycle-index;
 const a=palette[index],b=palette[(index+1)%palette.length];let value=0;
 for(const shift of [16,8,0])value|=Math.round(((a>>shift)&255)*(1-t)+((b>>shift)&255)*t)<<shift;
 return value;
}
function at(p,u,v){
 return {x:(p[0].x*(1-u)+p[1].x*u)*(1-v)+(p[3].x*(1-u)+p[2].x*u)*v,
  y:(p[0].y*(1-u)+p[1].y*u)*(1-v)+(p[3].y*(1-u)+p[2].y*u)*v};
}
function clipDiagonal(points,edge,greater){
 const out=[];
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],av=a.u+a.v,bv=b.u+b.v,insideA=greater?av>=edge:av<=edge,insideB=greater?bv>=edge:bv<=edge;
  if(insideA)out.push(a);
  if(insideA!==insideB){const t=(edge-av)/(bv-av);out.push({u:a.u+(b.u-a.u)*t,v:a.v+(b.v-a.v)*t});}
 }
 return out;
}
const SQUARE=[{u:.03,v:.03},{u:.97,v:.03},{u:.97,v:.97},{u:.03,v:.97}];
const diamond=radius=>[[.5,.5-radius],[.5+radius,.5],[.5,.5+radius],[.5-radius,.5]];

export function drawMappedPanel(g,panel,turn,energy,index=0,style='timber'){
 if(!valid(panel))return;
 turn=Number.isFinite(turn)?turn:0;energy=clamp(Number.isFinite(energy)?energy:.72,0,1.35);
 const facade=style==='facade',palette=PALETTES[style]??PALETTES.timber,phase=turn+index*.83;
 const colour=colourAt(palette,phase*.45),map=points=>points.map(([u,v])=>at(panel,u,v));
 // The pale illustrated Pagoda already contains bright baked projections.
 // A translucent violet bed gives the live imagery dark negative space while
 // retaining the carved stone beneath; timber keeps its gentler colour wash.
 g.fillStyle(facade?0x1d093c:colour,(facade?.43:.10)*energy).fillPoints(panel,true);
 for(let band=-2;band<6;band++){
  const edge=band*.45+((phase*.16)% .45+.45)%.45;
  const uv=clipDiagonal(clipDiagonal(SQUARE,edge,true),edge+(facade?.23:.17),false);
  if(uv.length<3)continue;
  const hue=colourAt(palette,phase*.45+edge*2.7);
  g.fillStyle(hue,(facade?.53:.29)*energy).fillPoints(uv.map(p=>at(panel,p.u,p.v)),true);
 }
 // Expanding diamond contours follow existing geometric timber and the
 // Pagoda facets. Their envelope fades them in/out instead of popping at wrap.
 for(let ring=0;ring<4;ring++){
  const travel=((phase*.09+ring/4)%1+1)%1,radius=.06+travel*.37;
  const envelope=Math.sin(travel*Math.PI),hue=colourAt(palette,phase*.45+ring*.75);
  const points=map(diamond(radius));
  g.lineStyle(facade?3.2:2.6,hue,(facade?.57:.22)*envelope*energy).strokePoints(points,true);
  g.lineStyle(facade?1.2:1.3,0xeafff0,(facade?.42:.69)*envelope*energy).strokePoints(points,true);
 }
 if(facade){
  // A rotating sixfold flower gives each wall its own mapped motion, while
  // staying well away from the panel boundary and the real arched openings.
  for(let petal=0;petal<6;petal++){
   const angle=petal/6*TAU+phase*.22,r=.29+.035*Math.sin(phase*.6);
   const points=[[.5,.5],[.5+Math.cos(angle-.36)*r,.5+Math.sin(angle-.36)*r],
    [.5+Math.cos(angle)*(r+.09),.5+Math.sin(angle)*(r+.09)],
    [.5+Math.cos(angle+.36)*r,.5+Math.sin(angle+.36)*r]];
   g.fillStyle(colourAt(palette,phase*.45+petal*.65),.44*energy).fillPoints(map(points),true);
  }
 }
}

export function drawCanopyMapping(g,{petals=[],diamonds=[]}={},turn=0,energy=.72){
 turn=Number.isFinite(turn)?turn:0;energy=clamp(Number.isFinite(energy)?energy:.72,0,1.35);
 petals.forEach((panel,index)=>{
  if(!valid(panel))return;
  const phase=turn*.72-index/Math.max(1,petals.length)*TAU,wave=.5+.5*Math.cos(phase);
  const colour=colourAt(PALETTES.canopy,turn*.35+index*.45);
  g.fillStyle(colour,(.12+.25*wave*wave)*energy).fillPoints(panel,true);
  // The illuminated inner petal swells in place. The physical cloth and panel
  // seams never translate, so the canopy stays attached to its source art.
  const centre=panel.reduce((p,v)=>({x:p.x+v.x/4,y:p.y+v.y/4}),{x:0,y:0});
  const scale=.38+.38*(.5+.5*Math.sin(phase+turn*.2));
  const inner=panel.map(p=>({x:centre.x+(p.x-centre.x)*scale,y:centre.y+(p.y-centre.y)*scale}));
  g.fillStyle(colourAt(PALETTES.canopy,turn*.35+index*.45+1.8),(.22+.18*wave)*energy).fillPoints(inner,true);
  g.lineStyle(1.6,0xf0ffe9,(.36+.27*wave)*energy).strokePoints(inner,true);
  g.lineStyle(1.5,colour,(.38+.30*wave)*energy).strokePoints(panel,true);
 });
 diamonds.forEach((panel,index)=>drawMappedPanel(g,panel,turn*.72,energy,index+2,'canopy'));
}
