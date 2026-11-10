// Disposable AMP backstage art. All motion follows round elapsed time so pause
// freezes lighting, deliveries and the temporary prize together.
export const VENDOR_POINT = {x:205,y:250,radius:42};

export const DELIVERY_RECIPIENTS = [
  {id:'dancer-0',index:0,name:'Sunny',costume:'Golden crown',color:0xffca67},
  {id:'dancer-1',index:1,name:'Orbit',costume:'Mint headphones',color:0x75e0d2},
  {id:'dancer-2',index:2,name:'Violet',costume:'Purple wizard hat',color:0xc4a1ff},
];

export const AMP_DELIVERY_STAGE = {
  id:'smf-amp-backstage',name:'AMP backstage',timingId:'smf-amp-clock-preview-1',
  target:3,spawn:{x:205,y:355},playBounds:{minX:60,maxX:900,minY:208,maxY:602},
  crowdAnchors:[[410,330],[675,315],[575,500],[300,490],[805,485],[830,250],[470,420],[700,430],[415,550],[560,265]],
  crowdSpeed:.45,obstacles:[],mud:[],flowSpawns:[],
  palette:{wash:0xbb7056,accent:0xffd78a},
};

const C = {ink:0x141c28,cream:0xffedba,gold:0xffca67,mint:0x75e0d2,pink:0xed8fb8,purple:0xc4a1ff};
const byId = id => DELIVERY_RECIPIENTS.find(person=>person.id===id);
const hex = value => `#${value.toString(16).padStart(6,'0')}`;

function starPoints(x,y,outer,inner,points=5) {
  return Array.from({length:points*2},(_,i)=>{
    const angle=i*Math.PI/points-Math.PI/2,r=i%2?inner:outer;
    return {x:x+Math.cos(angle)*r,y:y+Math.sin(angle)*r};
  });
}

function sandwich(g,x,y,size=1,alpha=1) {
  const p=(dx,dy)=>({x:x+dx*size,y:y+dy*size});
  g.fillStyle(0x5a332a,.35*alpha).fillEllipse(x,y+9*size,34*size,14*size);
  g.fillStyle(0xab5a32,alpha).fillPoints([p(-16,-5),p(16,-5),p(-6,14)],true);
  g.fillStyle(0xffc332,alpha).fillPoints([p(-17,-9),p(18,-8),p(-6,12)],true);
  g.fillStyle(0xffd44e,alpha).fillRoundedRect(x-5*size,y+3*size,4*size,11*size,2*size);
  g.fillStyle(0xc97b3c,alpha).fillPoints([p(-17,-13),p(18,-12),p(-6,8)],true);
  g.fillStyle(0xffdf94,alpha).fillPoints([p(-12,-11),p(12,-10),p(-5,3)],true);
  g.lineStyle(2*size,0xc38142,.85*alpha).lineBetween(x-9*size,y-7*size,x-1*size,y-3*size).lineBetween(x-2*size,y-9*size,x+5*size,y-6*size);
}

function cheese(g,x,y,size=1) {
  const points=[{x:x-20*size,y:y-10*size},{x:x+10*size,y:y-24*size},{x:x+24*size,y:y-8*size},{x:x+24*size,y:y+15*size},{x:x-20*size,y:y+15*size}];
  g.fillStyle(0xd27a2b).fillPoints(points,true);
  g.fillStyle(0xffcd42).fillRect(x-20*size,y-8*size,44*size,21*size);
  g.fillStyle(0xffe691).fillTriangle(x-20*size,y-10*size,x+10*size,y-24*size,x+24*size,y-8*size);
  g.fillStyle(0xc18429).fillCircle(x-10*size,y+1*size,4*size).fillCircle(x+12*size,y+6*size,5*size).fillCircle(x+2*size,y-4*size,2.5*size);
}

function portraitAccessory(g,recipient) {
  const color=recipient.color;
  if(recipient.index===0) {
    g.fillStyle(0xae6435).fillEllipse(0,-16,19,12);
    g.fillStyle(color).fillPoints([{x:-15,y:-19},{x:-15,y:-30},{x:-7,y:-25},{x:0,y:-35},{x:7,y:-25},{x:15,y:-30},{x:15,y:-19}],true);
    g.lineStyle(2,0xffedba).lineBetween(-14,-20,14,-20);
  } else if(recipient.index===1) {
    g.fillStyle(0x25394a).fillEllipse(0,-17,18,13);
    g.lineStyle(4,color).beginPath().arc(0,-12,12,Math.PI,Math.PI*2).strokePath();
    g.fillStyle(color).fillRoundedRect(-15,-17,6,14,3).fillRoundedRect(9,-17,6,14,3);
    g.lineStyle(2,0xffffff,.8).lineBetween(-13,-15,-13,-8).lineBetween(11,-15,11,-8);
  } else {
    g.fillStyle(0x634481).fillEllipse(0,-16,21,13);
    g.fillStyle(color).fillTriangle(-15,-19,2,-48,14,-19).fillEllipse(0,-19,40,9);
    g.fillStyle(0xffedba).fillPoints(starPoints(0,-30,4,1.8),true);
  }
}

function drawRecipient(g,recipient) {
  g.clear();
  g.lineStyle(4,0xb8b0a7).lineBetween(-5,9,-8,21).lineBetween(5,9,8,21);
  g.fillStyle(recipient.color).fillRoundedRect(-11,-6,22,23,7);
  g.fillStyle(C.ink,.35).fillRoundedRect(-5,0,10,13,3);
  g.lineStyle(4,recipient.color).lineBetween(-10,-1,-18,-10).lineBetween(10,-1,18,-10);
  g.fillStyle(recipient.index===1?0xa87051:0xe7b28e).fillCircle(-18,-10,3).fillCircle(18,-10,3).fillCircle(0,-12,9);
  g.fillStyle(C.ink).fillCircle(-3,-12,1.2).fillCircle(3,-12,1.2);
  g.lineStyle(1.4,0x855440).lineBetween(-2,-7,2,-7);
  portraitAccessory(g,recipient);
}

// The order card matches the costume itself; there are no target badges.
export function recipientPortrait(id) {
  const person=byId(id)??DELIVERY_RECIPIENTS[0],color=hex(person.color);
  const accessory=person.index===0
    ? `<path d="M27 29V14l9 7 12-16 12 16 9-7v15z" fill="${color}"/><path d="M28 29h40" stroke="#ffedba" stroke-width="3"/>`
    : person.index===1
      ? `<path d="M31 36a17 17 0 0 1 34 0" fill="none" stroke="${color}" stroke-width="6"/><rect x="26" y="30" width="8" height="20" rx="4" fill="${color}"/><rect x="62" y="30" width="8" height="20" rx="4" fill="${color}"/>`
      : `<ellipse cx="48" cy="29" rx="29" ry="6" fill="${color}"/><path d="M29 29 50 0l17 29z" fill="${color}"/><path d="m48 12 2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#ffedba"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${person.name}: ${person.costume}"><rect x="1" y="1" width="94" height="94" rx="21" fill="#1c2633" stroke="${color}" stroke-opacity=".5"/><ellipse cx="48" cy="96" rx="29" ry="38" fill="${color}"/><rect x="39" y="63" width="18" height="30" rx="7" fill="#142434" opacity=".3"/><circle cx="48" cy="42" r="18" fill="${person.index===1?'#a87051':'#e7b28e'}"/><circle cx="42" cy="42" r="2" fill="#141c28"/><circle cx="54" cy="42" r="2" fill="#141c28"/><path d="M43 51q5 4 10 0" fill="none" stroke="#855440" stroke-width="2"/>${accessory}</svg>`;
}

export function createAMPBackstageView(scene,stage) {
  if(stage.id!=='smf-amp-backstage')return null;
  const g=scene.add.graphics().setDepth(0);
  g.fillStyle(0x142329).fillRect(0,0,960,640);
  // Warm, quiet floor leaves the approach and clean-pass lanes easy to read.
  g.fillStyle(0x31403d).fillRoundedRect(43,178,874,446,28);
  g.fillStyle(0x39443f).fillRoundedRect(66,202,828,398,23);
  for(let y=210;y<610;y+=25)g.lineStyle(1,0xd5b38a,.035).lineBetween(65,y,895,y);
  for(let i=0;i<130;i++) {
    const x=72+(i*137%817),y=216+(i*79%378);
    g.fillStyle(i%3?0xdfc299:0x152d2a,.08).fillCircle(x,y,1+i%2);
  }
  g.lineStyle(2,0xffd28c,.18).strokeRoundedRect(53,192,854,421,24);
  // Dense backdrop / curtains; all solid scenery stays above the walking area.
  g.fillStyle(0x102127).fillRect(0,0,960,190);
  g.fillStyle(0x3a303c).fillRoundedRect(365,38,411,136,10);
  for(let x=378;x<775;x+=24) {
    g.fillStyle(0x714754,.22).fillRect(x,41,10,129);
    g.lineStyle(1,0xe29a82,.08).lineBetween(x,42,x,169);
  }
  g.fillStyle(0x18232d).fillRoundedRect(415,63,310,105,8);
  g.lineStyle(2,0xa796c7,.35).strokeRoundedRect(415,63,310,105,8);
  g.fillStyle(0x14232a).fillEllipse(568,180,360,26);
  // Intimate S2 booth and two small stacks, outside the playable floor.
  for(const x of [380,726]) {
    g.fillStyle(0x0c1a23).fillRoundedRect(x,92,37,80,4);
    g.lineStyle(1,0x899897,.45).strokeRoundedRect(x,92,37,80,4);
    for(const y of [111,146]) {
      g.fillStyle(0x21333c).fillCircle(x+18,y,13);
      g.lineStyle(2,0x9aaab3,.4).strokeCircle(x+18,y,9);
      g.fillStyle(0x111e29).fillCircle(x+18,y,4);
    }
  }
  g.fillStyle(0x1b3039).fillRoundedRect(459,124,222,52,5);
  g.fillStyle(0x586565).fillRoundedRect(450,119,240,10,3);
  g.lineStyle(2,0xc4a1ff,.8).lineBetween(463,171,678,171);
  g.fillStyle(0x101d29).fillRoundedRect(490,105,57,17,3).fillRoundedRect(586,105,57,17,3);
  g.lineStyle(1.5,0xd5c3f0,.75).strokeEllipse(516,111,31,8).strokeEllipse(614,111,31,8);
  g.fillStyle(0xe5aa87).fillCircle(568,93,9);
  g.fillStyle(0x444558).fillRoundedRect(555,101,27,18,6);
  g.lineStyle(3,0xcea7f5).lineBetween(556,107,542,113).lineBetween(581,107,591,112);
  g.lineStyle(3,0x86ddd0).beginPath().arc(568,92,11,Math.PI,Math.PI*2).strokePath();
  g.fillStyle(0x86ddd0).fillRoundedRect(554,89,5,10,2).fillRoundedRect(578,89,5,10,2);
  scene.add.text(570,63,'S2',{fontFamily:'Arial',fontSize:'29px',fontStyle:'bold',color:'#e8d5ff',letterSpacing:5}).setOrigin(.5).setDepth(.5);
  scene.add.text(570,151,'AFTER HOURS',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#d0b8ec',letterSpacing:4}).setOrigin(.5).setDepth(.5);
  // The cart: striped canvas, warm griddle, wheels and a smiling cook.
  for(let i=7;i>0;i--)g.fillStyle(0xffc46f,.012).fillEllipse(205,179,i*46,i*29);
  g.fillStyle(0x152126,.55).fillEllipse(205,196,247,31);
  g.fillStyle(0x8b563c).fillRoundedRect(94,138,222,57,7);
  g.fillStyle(0xc47d4a).fillRoundedRect(102,145,206,40,4);
  g.lineStyle(2,0xffce86,.35).strokeRoundedRect(106,149,198,32,3);
  for(const x of [126,283]) {
    g.fillStyle(0x152027).fillCircle(x,195,12);
    g.fillStyle(0x7d8e8c).fillCircle(x,195,5);
  }
  g.fillStyle(0x5c4339).fillRect(101,66,5,76).fillRect(305,66,5,76);
  g.fillStyle(0xe8bd74).fillPoints([{x:85,y:55},{x:321,y:55},{x:337,y:91},{x:69,y:91}],true);
  for(let i=0;i<9;i++)g.fillStyle(i%2?0xb45e45:0xffd88f).fillRect(72+i*29,89,29,16);
  g.fillStyle(0x402f2a).fillRoundedRect(91,58,227,29,4);
  scene.add.text(205,73,'GRILLED CHEESE',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#ffe7b0',letterSpacing:1}).setOrigin(.5).setDepth(.5);
  g.fillStyle(0xe5ad88).fillCircle(212,113,9);
  g.fillStyle(0xffebca).fillRoundedRect(198,121,29,21,7).fillEllipse(212,103,26,9).fillRoundedRect(203,95,18,12,4);
  g.lineStyle(2,0x633a32).lineBetween(209,116,215,116);
  g.fillStyle(0x252d31).fillRoundedRect(104,136,204,9,3);
  g.fillStyle(0x626461).fillRoundedRect(115,129,72,8,3);
  for(let x=121;x<184;x+=8)g.lineStyle(1,0x101e25,.7).lineBetween(x,130,x,135);
  sandwich(g,142,129,.6);sandwich(g,173,129,.54);
  g.fillStyle(0xe7d2ad).fillEllipse(248,137,40,8);
  sandwich(g,248,132,.74);
  scene.add.text(205,167,'HOT • GOLDEN • GOOD',{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#ffe3ad',letterSpacing:1}).setOrigin(.5).setDepth(.5);
  // Greenery frames the floor without introducing hidden collision scenery.
  for(const [x,y,s] of [[31,210,1],[928,220,1.1],[27,414,.85],[931,435,.9],[48,627,.9],[912,624,1]]) {
    g.fillStyle(0x754e43).fillRoundedRect(x-12*s,y-4*s,24*s,24*s,4);
    g.lineStyle(3,0x39796a,.9);
    for(let i=0;i<7;i++) {
      const dx=Math.sin(i*1.8)*24*s,dy=-19-Math.abs(Math.cos(i))*30*s;
      g.lineBetween(x,y,x+dx,y+dy);
      g.fillStyle(i%2?0x45816e:0x2f655b).fillEllipse(x+dx,y+dy,11*s,24*s);
    }
  }
  // Fairy-light cables and warm bulbs arch over the playable clearing.
  const bulbs=[];
  for(const [left,right,base,sag] of [[32,933,13,29],[30,349,113,30],[775,932,110,39]]) {
    const points=Array.from({length:31},(_,i)=>({x:left+(right-left)*i/30,y:base+Math.sin(i/30*Math.PI)*sag}));
    g.lineStyle(1,0xc4ab84,.5).strokePoints(points);
    points.filter((_,i)=>i%3===0).forEach(p=>{
      g.lineStyle(1,0x826b54,.8).lineBetween(p.x,p.y,p.x,p.y+5);
      g.fillStyle(C.gold,.055).fillCircle(p.x,p.y+7,13);
      bulbs.push(scene.add.circle(p.x,p.y+7,2.6,0xffdc9e,1).setDepth(.7));
    });
  }
  const led=scene.add.graphics().setDepth(.3),steam=scene.add.graphics().setDepth(.8);
  return {
    ownsLighting:true,
    update(elapsed,phase,reducedMotion) {
      led.clear();steam.clear();
      const beat=reducedMotion?.35:.5+.5*Math.sin(elapsed*Math.PI/428.57);
      // Small booth accents, never full-floor flashes or obstructing beams.
      for(let i=0;i<13;i++) {
        const x=430+i*23,height=reducedMotion?10:8+Math.sin(elapsed*.004+i*.8)**2*17;
        led.fillStyle(i%2?C.mint:C.purple,.4+beat*.28).fillRoundedRect(x,118-height,7,height,2);
      }
      led.lineStyle(2,C.purple,.3+beat*.35).strokeRoundedRect(423,71,294,50,4);
      bulbs.forEach((bulb,i)=>bulb.setAlpha(reducedMotion?.9:.75+Math.sin(elapsed*.0015+i*.7)*.2));
      for(let i=0;i<3;i++) {
        const drift=reducedMotion?0:Math.sin(elapsed*.002+i)*3;
        const rise=reducedMotion?0:(elapsed*.009+i*7)%16;
        steam.lineStyle(1.6,C.cream,reducedMotion?.3:.35-rise*.012).beginPath().moveTo(137+i*17,120-rise).lineTo(134+i*17+drift,113-rise).lineTo(139+i*17,106-rise).strokePath();
      }
    },
  };
}

export function createDeliveryView(scene) {
  const owned=[],track=node=>(owned.push(node),node);
  for(const recipient of DELIVERY_RECIPIENTS) {
    const person=scene.crowd.people[recipient.index];
    if(!person)continue;
    drawRecipient(person.body,recipient);
  }
  const vendor=track(scene.add.graphics().setDepth(6));
  const ticket=track(scene.add.graphics().setPosition(302,180).setScale(.46).setDepth(6.1));
  const pickupText=track(scene.add.text(VENDOR_POINT.x,VENDOR_POINT.y+34,'PICK UP',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#ffe4a5',letterSpacing:2}).setOrigin(.5).setDepth(7));
  const hand=track(scene.add.graphics());sandwich(hand,22,-2,.83);scene.dancer.add(hand);
  const prize=track(scene.add.graphics());scene.dancer.add(prize);prize.setVisible(false);
  prize.lineStyle(3,0xb59365).lineBetween(-21,8,-21,-57);cheese(prize,-21,-61,.65);
  const transient=track(scene.add.graphics().setDepth(26));
  let elapsed=0,reduced=false,lastState=null,feedbacks=[],destroyed=false,lastTicket=null;

  function update(state,now=0,reducedMotion=false) {
    if(destroyed)return;
    elapsed=now;reduced=reducedMotion;lastState=state;
    const recipient=byId(state.recipientId),ready=!state.carrying&&!state.complete;
    hand.setVisible(Boolean(state.carrying||state.complete));prize.setVisible(Boolean(state.complete));
    if(state.complete)prize.setRotation(reduced?0:Math.sin(elapsed*.004)*.04);
    vendor.clear();
    const {x,y,radius}=VENDOR_POINT;
    vendor.fillStyle(C.gold,ready?.095:.025).fillCircle(x,y,radius);
    vendor.lineStyle(ready?2.5:1.5,C.gold,ready?.7:.25).strokeCircle(x,y,radius-5);
    vendor.lineStyle(2,C.cream,ready?.7:.16).lineBetween(x-10,y-2,x,y+7).lineBetween(x,y+7,x+10,y-2);
    pickupText.setText(state.complete?'ENJOY!':state.carrying?'ONE AT A TIME':'PICK UP').setAlpha(ready||state.complete?.95:.45);
    // The order ticket is mounted on the cart beside the serving counter.
    vendor.fillStyle(C.ink).fillRoundedRect(282,153,40,41,5);
    vendor.lineStyle(2,recipient?.color??C.gold,.8).strokeRoundedRect(282,153,40,41,5);
    if(state.complete)cheese(vendor,302,176,.45);
    ticket.setVisible(Boolean(recipient)&&!state.complete);
    if(recipient&&lastTicket!==recipient.id){drawRecipient(ticket,recipient);lastTicket=recipient.id;}
    transient.clear();
    feedbacks=feedbacks.filter(item=>elapsed-item.at<item.duration);
    for(const item of feedbacks) {
      const progress=Math.max(0,(elapsed-item.at)/item.duration),alpha=Math.min(1,(1-progress)*2);
      if(item.type==='dropped') {
        const drop=reduced?14:Math.min(1,progress*4)*20;
        sandwich(transient,item.x+17,item.y+drop,.85,alpha);
        transient.lineStyle(2,C.gold,alpha*.55).lineBetween(item.x-4,item.y+drop+11,item.x-10,item.y+drop+16).lineBetween(item.x+35,item.y+drop+9,item.x+42,item.y+drop+14);
      } else {
        const person=scene.crowd.people.find(p=>p.id===item.dancerId)??scene.crowd.people[Number(item.dancerId?.split('-')[1])];
        const px=person?.node.x??item.x,py=person?.node.y??item.y;
        const rise=reduced?0:progress*26,color=item.type==='wrong'?C.pink:C.mint;
        if(item.type==='wrong') {
          transient.fillStyle(color,alpha).fillCircle(px-5,py-41-rise,6).fillCircle(px+5,py-41-rise,6).fillTriangle(px-10,py-40-rise,px+10,py-40-rise,px,py-27-rise);
          sandwich(transient,px+22,py-4,.7,alpha);
        } else if(item.type==='delivered'||item.type==='complete') {
          transient.lineStyle(4,color,alpha).lineBetween(px-8,py-41-rise,px-1,py-34-rise).lineBetween(px-1,py-34-rise,px+13,py-49-rise);
          if(!reduced)for(let i=0;i<8;i++) {
            const angle=i*Math.PI/4,distance=20+progress*36;
            transient.fillStyle(i%2?C.gold:color,alpha).fillCircle(px+Math.cos(angle)*distance,py+Math.sin(angle)*distance,2.5);
          }
        } else if(item.type==='pickup') {
          transient.lineStyle(2,C.gold,alpha*.6).strokeCircle(item.x,item.y,reduced?29:24+progress*24);
        }
      }
    }
  }

  return {
    update,
    feedback(event) {
      if(destroyed||!event)return;
      feedbacks.push({type:event.type??event.kind,dancerId:event.dancerId,x:scene.dancer.x,y:scene.dancer.y,at:elapsed,duration:event.type==='dropped'?1350:1150});
      if(feedbacks.length>8)feedbacks.shift();
      if(lastState)update(lastState,elapsed,reduced);
    },
    destroy() {
      if(destroyed)return;
      destroyed=true;feedbacks=[];
      owned.forEach(node=>{if(node.scene)node.destroy();});
    },
  };
}
