// Logical pickup positions never bob with the artwork. All accents are temporary.
function trinket(g,index,color){
 g.lineStyle(3,0xfff1cc,1);g.fillStyle(color,1);
 if(index===0){g.strokeCircle(-5,-5,7);g.lineBetween(0,0,13,13).lineBetween(9,9,14,4).lineBetween(13,13,18,8);}
 else if(index===1){g.fillCircle(-7,-5,9).fillCircle(7,-5,9).fillTriangle(-15,-2,15,-2,0,17);}
 else if(index===2){g.fillRoundedRect(-4,0,8,17,3);g.fillEllipse(0,-2,33,20);g.fillStyle(0xfff1cc).fillCircle(-7,-4,3).fillCircle(6,-6,3);}
 else if(index===3){g.fillCircle(0,0,15);g.fillStyle(0x173638).fillCircle(7,-5,12);}
 else if(index===4){g.fillStyle(0x182c39).fillCircle(0,0,17);g.strokeCircle(0,0,17).strokeCircle(0,0,10);g.fillStyle(color).fillCircle(0,0,6);}
 else{g.fillEllipse(-7,-13,8,26).fillEllipse(7,-13,8,26).fillCircle(0,5,13);g.fillStyle(0x1d2e32).fillCircle(-5,3,2).fillCircle(5,3,2);}
}
export function createActivityView(scene,config){
 const objects=[],own=o=>{objects.push(o);return o;};
 const marker=own(scene.add.container(0,0).setDepth(18));
 const halo=scene.add.circle(0,0,35,0xffdf91,.12).setStrokeStyle(2,0xffe6ae,.8);
 const art=scene.add.graphics(),label=scene.add.text(0,47,'',{fontFamily:'Arial',fontSize:'13px',color:'#fff0c7',backgroundColor:'#122d32',padding:{x:6,y:3}}).setOrigin(.5);
 marker.add([halo,art,label]);
 let lastIndex=-1;
 const bed=config.bed?own(scene.add.graphics().setDepth(8)):null;
 const reward=own(scene.add.graphics().setDepth(22));
 const exploration=config.activity==='explore'?config.points.map(p=>{
  const ring=own(scene.add.circle(p.x,p.y,38).setStrokeStyle(2,0xffe1a1,.8).setDepth(7));
  return {point:p,ring};
 }):[];
 const greeted=config.activity==='greet'?scene.crowd.people.map(p=>{
  const bracelet=scene.add.graphics();p.node.add(bracelet);return {person:p,bracelet};
 }):[];
 function drawReward(state,elapsed,reduced){
  reward.clear();const {x,y}=scene.dancer;
  if(state.carrying){reward.fillStyle(0xffe4a6).fillEllipse(x+19,y-2,10,15);reward.lineStyle(2,0xb9efae).lineBetween(x+19,y-10,x+23,y-18);}
  if(!state.complete||!config.reward)return;
  if(config.id==='rabbit-hole'){
   reward.fillStyle(0xfff0d7).fillEllipse(x-7,y-36,9,28).fillEllipse(x+7,y-36,9,28);
   reward.fillStyle(0xe49fba).fillEllipse(x-7,y-36,4,19).fillEllipse(x+7,y-36,4,19);
  }else if(config.id==='secret-garden'){
   for(let i=0;i<6;i++){const a=i*Math.PI/3+(reduced?0:elapsed*.0005);reward.fillStyle(i%2?0xffbbce:0xf6e597,.9).fillCircle(x+Math.cos(a)*10,y-29+Math.sin(a)*10,6);}
   reward.fillStyle(0xecffd1).fillCircle(x,y-29,6);
  }else{
   reward.lineStyle(3,0xa7c5b3).lineBetween(x+20,y+7,x+20,y-49);
   reward.fillStyle(0xffcf86,.12).fillCircle(x+20,y-54,22);reward.fillStyle(0xffda96).fillRoundedRect(x+11,y-64,18,22,5);
   reward.lineStyle(1,0x986a4f).strokeRoundedRect(x+11,y-64,18,22,5).lineBetween(x+20,y-64,x+20,y-42);
  }
 }
 return {
  update(state,elapsed,reduced){
   const current=config.points[state.progress],show=(config.activity==='trail'||config.activity==='garden')&&!state.complete&&!state.carrying&&current;
   marker.setVisible(!!show);
   if(show){
    marker.setPosition(current.x,current.y);art.y=reduced?0:Math.sin(elapsed*.004)*3;
    if(lastIndex!==state.progress){lastIndex=state.progress;art.clear();
     if(config.activity==='garden'){art.fillStyle([0xffdb8c,0xffb8d8,0xbbe5ff][state.progress]).fillEllipse(0,0,17,25);art.lineStyle(2,0xecffd7).lineBetween(0,4,0,-16).lineBetween(0,-8,7,-14);}
     else trinket(art,state.progress,[0xffd88c,0xffa4c7,0x9de6c2,0xdfb5ff,0x9edcff,0xffdba2][state.progress]);
     label.setText(current.label);
    }
    halo.setAlpha(reduced?.8:.75+Math.sin(elapsed*.003)*.2);
   }
   if(bed){
    bed.clear();const {x,y}=config.bed;bed.fillStyle(0x273e34).fillEllipse(x,y,94,52);bed.lineStyle(3,state.carrying?0xffe9a6:0x8fcda3,.9).strokeEllipse(x,y,94,52);
    for(let i=0;i<3;i++){const bx=x-26+i*26;bed.fillStyle(i<state.progress?0xffc8d6:0x73846c).fillCircle(bx,y,i<state.progress?9:4);}
   }
   exploration.forEach(({point,ring})=>ring.setVisible(!state.visitedIds.includes(point.id)).setAlpha(reduced?.8:.65+Math.sin(elapsed*.003)*.2));
   greeted.forEach(({person,bracelet})=>{bracelet.clear();if(state.greetedIds.includes(person.id)){
    bracelet.lineStyle(3,0xffd690,.95).strokeCircle(-12,-6,4);
    bracelet.lineStyle(2.5,0xffd690,.85).strokeEllipse(0,16,45,17);
   }});
   drawReward(state,elapsed,reduced);
  },
  feedback(event){
   const p=(event.type==='planted'?config.bed:config.points.find(p=>p.id===event.id))||scene.crowd.people.find(person=>person.id===event.id)?.node||scene.dancer;
   // Completion stays posed so the cosmetic can be inspected at phone size.
   if(event.type!=='complete')scene.effect(p.x,p.y,0xffdda0,0,false,event.type==='pickup'?'SEED FOUND':event.type==='planted'?'BLOOM!':event.type==='greeted'?'GOOD COMPANY':event.type==='visited'?'FOUND IT':'FOUND!');
  },
  destroy(){objects.forEach(o=>o.destroy());greeted.forEach(({bracelet})=>bracelet.destroy());},
 };
}
