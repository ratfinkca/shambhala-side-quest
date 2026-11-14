// Totems are held props, not another body part: the caller supplies the actual
// carry palm for this pose. Keep the pole on that palm in every direction.
const INK=0x302a48;
const DEFAULT_SKIN=[0x9b5b45,0xcf9167,0xf1bc8c,0xffd9ad];
const COLOURS={
 '#':INK,g:0xe9bb62,G:0xffe6a1,b:0x8d674b,p:0xa97dd0,P:0xd4b1ec,
 m:0xc675a0,M:0xf3aaca,t:0x69bfae,T:0xb8edd2,c:0xffe1b3,w:0xfff0ce,
 v:0x536079,V:0x95a8ba,
};
// Icons share an 18–20 px maximum footprint and sit on the same short pole.
// Single-pixel edge steps preserve their silhouettes without blurring at zoom.
const ICONS={
 star:[
  '        ##        ',
  '       #GG#       ',
  '       #GG#       ',
  '      #gGGg#      ',
  '  #####gGGg#####  ',
  ' #GGGGGGGGGGGGGG# ',
  '  #gGGGGGGGGGGg#  ',
  '   #gGGGGGGGGg#   ',
  '    #gGGGGGGg#    ',
  '    #gGGGGGGg#    ',
  '   #gGG##GGGg#    ',
  '   #gG#  #GGg#    ',
  '   ###    ####    ',
 ],
 mushroom:[
  '      ######      ',
  '    ##MMMMMM##    ',
  '  ##MMMMwwMMMM##  ',
  ' #MMwwMMwwMMMMMM# ',
  '#MMMwwMMMMMMwwMMM#',
  '#MMMMMMMMMMMwwMMM#',
  '#mmmmmmmmmmmmmmmm#',
  ' ################ ',
  '      #cccc#      ',
  '      #cwwc#      ',
  '      #cwwc#      ',
  '      #cccc#      ',
  '       ####       ',
 ],
 moon:[
  '     #######  ',
  '   ##GGGG##   ',
  '  #GGGGG#     ',
  ' #GGGGg#      ',
  ' #GGGg#       ',
  '#GGGGg#       ',
  '#GGGGg#       ',
  '#GGGGg#       ',
  ' #GGGg#       ',
  ' #GGGGg#      ',
  '  #GGGGG#     ',
  '   ##GGGG##   ',
  '     #######  ',
 ],
 eye:[
  '       ######       ',
  '    ###PPPPPP###    ',
  '  ##PPPPttttPPPP##  ',
  ' #PPPPttTTttttPPPP# ',
  '#PPPPPttT##tttPPPPP#',
  '#PPPPPttt##tttPPPPP#',
  ' #PPPPttttttttPPPP# ',
  '  ##PPPPttttPPPP##  ',
  '    ###pppppp###    ',
  '       ######       ',
 ],
 heart:[
  '  #####  #####  ',
  ' #MMMMM##MMMMM# ',
  '#MMwwMMMMMMMMMM#',
  '#MMwMMMMMMMMMMM#',
  '#MMMMMMMMMMMMMM#',
  ' #MMMMMMMMMMMM# ',
  '  #MMMMMMMMMM#  ',
  '   #MMMMMMMM#   ',
  '    #MMMMMM#    ',
  '     #mmmm#     ',
  '      #mm#      ',
  '       ##       ',
 ],
 peace:[
  '     ######     ',
  '   ##GGGGGG##   ',
  '  #GG######GG#  ',
  ' #GG#  GG  #GG# ',
  ' #G#   GG   #G# ',
  '#GG#   GG   #GG#',
  '#GG#   GG   #GG#',
  '#GG#  GGGG  #GG#',
  '#GG# GG##GG #GG#',
  ' #G#GG GG GG#G# ',
  ' #GGG  GG  GGG# ',
  '  #GG######GG#  ',
  '   ##gggggg##   ',
  '     ######     ',
 ],
 jellyfish:[
  '     ######     ',
  '   ##PPPPPP##   ',
  '  #PPPPwwPPPP#  ',
  ' #PPPPPwwPPPPP# ',
  '#PPPPPPPPPPPPPP#',
  '#PPPPPPPPPPPPPP#',
  '#pppppppppppppp#',
  '################',
 ],
 ufo:[
  '       ######       ',
  '      #TTTTTT#      ',
  '     #TwwTTTTT#     ',
  '     #TTTTTTTT#     ',
  '  ####tttttttt####  ',
  ' #PPPPPPPPPPPPPPPP# ',
  '#PPPPPPPPPPPPPPPPPP#',
  '#pppGGpppGGpppGGppp#',
  ' ################## ',
  '    ##vvvvvvvv##    ',
  '      ########      ',
 ],
 mixtape:[
  ' ################## ',
  '#PPPPPPPPPPPPPPPPPP#',
  '#P################P#',
  '#P#cccccccccccccc#P#',
  '#P#c###cccc###ccc#P#',
  '#P#c#T#cccc#T#ccc#P#',
  '#P#c###cccc###ccc#P#',
  '#P################P#',
  '#PPPPPPPPPPPPPPPPPP#',
  '#ppp############ppp#',
  '#pp#VVVVVVVVVVVV#pp#',
  ' ################## ',
 ],
};

function rect(g,colour,x,y,w,h){g.fillStyle(colour,1).fillRect(Math.round(x),Math.round(y),w,h);}
function paintIcon(g,pattern,x,y){
 // Merge adjacent pixels of one colour; every destination remains integer ink.
 for(let row=0;row<pattern.length;row++){
  const line=pattern[row];let start=0;
  while(start<line.length){const token=line[start];let end=start+1;while(end<line.length&&line[end]===token)end++;
   if(COLOURS[token]!==undefined)rect(g,COLOURS[token],x+start,y+row,end-start,1);start=end;
  }
 }
}

export function staffLayout({hand={x:0,y:0},facing='down',back=false}={}){
 const grip={x:Math.round(Number.isFinite(hand?.x)?hand.x:0),y:Math.round(Number.isFinite(hand?.y)?hand.y:0)};
 return {grip,facing,back:Boolean(back),pole:{x:grip.x,top:grip.y-27,bottom:grip.y+3}};
}
export function totemLayout(id,options={}){
 const pattern=ICONS[id];if(!pattern)return null;
 const layout=staffLayout(options),{grip}=layout;
 const width=Math.max(...pattern.map(line=>line.length)),height=pattern.length;
 return {...layout,id,icon:{x:grip.x-Math.floor(width/2),y:grip.y-25-height,width,height}};
}
export function drawTotemPole(g,layout,{colour=0xb4a17b}={}){
 const {pole}=layout;
 rect(g,INK,pole.x-1,pole.top,3,pole.bottom-pole.top+1);
 rect(g,colour,pole.x,pole.top,1,pole.bottom-pole.top+1);
 rect(g,0xeee0ac,pole.x,pole.top+3,1,9);
}

/** Returns attachment metadata for a separate foreground hand layer. */
export function drawTotem(g,id,options={}){
 g.clear();const layout=totemLayout(id,options);if(!layout)return null;
 const {grip,icon}=layout;drawTotemPole(g,layout);
 paintIcon(g,ICONS[id],icon.x,icon.y);
 if(id==='jellyfish'){
  const sway=options.reduced?0:Math.floor((Number.isFinite(options.time)?options.time:0)/250)%2===0?-1:1;
  for(const offset of [-5,0,5]){
   const x=grip.x+offset,y=icon.y+icon.height;
   rect(g,INK,x-1,y,3,5);rect(g,0x9cddce,x,y,1,5);
   rect(g,INK,x+sway-1,y+4,3,3);rect(g,0x9cddce,x+sway,y+4,1,2);
  }
 }
 return layout;
}

/** Draw after the pole (and actor when front-facing), using the actor's skin. */
export function drawTotemGrip(g,layout,{skin=DEFAULT_SKIN}={}){
 g.clear();if(!layout)return;
 const shades=skin??DEFAULT_SKIN;
 const {x,y}=layout.grip,thumb=layout.facing==='left'?-1:1;
 rect(g,INK,x-3,y-2,6,5);
 rect(g,shades[0],x-2,y-1,4,3);
 rect(g,shades[2],x-2,y-1,4,2);
 rect(g,shades[layout.back?1:3],x-thumb,y-1,2,1);
 rect(g,shades[1],x+thumb*2-(thumb<0?1:0),y,2,2);
}
