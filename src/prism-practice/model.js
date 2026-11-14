// Shared Prism rules: no profiles, rewards, services or browser APIs.
const A = Object.freeze({x:480,y:240});
const B = Object.freeze({x:150,y:500});
const C = Object.freeze({x:810,y:500});
const O = Object.freeze({x:480,y:413});
const EPSILON = 1e-7;

export const PRISM = Object.freeze({
  width:960,height:640,bpm:120,phraseMs:8000,chargeMs:3000,
  celebrationMs:3500,movementThreshold:8,maxDeltaMs:50,entryY:498,
  spawn:Object.freeze({x:480,y:590}),
  clearing:Object.freeze({minX:100,maxX:860,minY:540,maxY:610}),
});
export const PRISM_FLOOR = Object.freeze([A,B,C]);
export const PRISM_RAMP = Object.freeze({minX:430,maxX:530,minY:480,maxY:565});
export const PRISM_ZONES = Object.freeze([
  {id:'cyan',label:'Cyan',shape:'diamond',symbol:'◆',color:0x64f6e3,points:[A,B,O]},
  {id:'magenta',label:'Magenta',shape:'star',symbol:'✦',color:0xf78de7,points:[A,O,C]},
  {id:'amber',label:'Amber',shape:'sun',symbol:'☀',color:0xffd46c,points:[B,C,O]},
].map(zone=>Object.freeze({...zone,points:Object.freeze(zone.points),center:Object.freeze({
  x:zone.points.reduce((sum,point)=>sum+point.x,0)/3,
  y:zone.points.reduce((sum,point)=>sum+point.y,0)/3,
})})));

const finitePoint = point => !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
const mix = (a,b,t) => ({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const cross = (a,b) => a.x*b.y-a.y*b.x;
const subtract = (a,b) => ({x:a.x-b.x,y:a.y-b.y});
const rectangle = bounds => [
  {x:bounds.minX,y:bounds.minY},{x:bounds.maxX,y:bounds.minY},
  {x:bounds.maxX,y:bounds.maxY},{x:bounds.minX,y:bounds.maxY},
];
const WALKABLE = [PRISM_FLOOR,rectangle(PRISM_RAMP),rectangle(PRISM.clearing)];

function inPolygon(point,polygon) {
  if (!finitePoint(point)) return false;
  let sign = 0;
  for (let i=0;i<polygon.length;i++) {
    const a=polygon[i],b=polygon[(i+1)%polygon.length];
    const side=cross(subtract(b,a),subtract(point,a));
    if (Math.abs(side)<=EPSILON) continue;
    if (sign && Math.sign(side)!==sign) return false;
    sign=Math.sign(side);
  }
  return true;
}

export const pointInPrismFloor = point => inPolygon(point,PRISM_FLOOR);
export function prismZoneAt(point) {
  return PRISM_ZONES.findIndex(zone=>inPolygon(point,zone.points));
}
const walkable = point => WALKABLE.some(polygon=>inPolygon(point,polygon));
export const pointInPrismWalkable = walkable;

// Intersect the entire movement segment, not just its endpoint. The clearing
// and floor are separated everywhere except the ramp, so endpoint clamping
// alone would let a large swipe jump through a side wall.
function segmentCuts(previous,point,polygons) {
  const cuts=[0,1],motion=subtract(point,previous);
  for (const polygon of polygons) {
    for (let i=0;i<polygon.length;i++) {
      const a=polygon[i],edge=subtract(polygon[(i+1)%polygon.length],a);
      const denominator=cross(motion,edge);
      if (Math.abs(denominator)<=EPSILON) continue;
      const offset=subtract(a,previous);
      const t=cross(offset,edge)/denominator,u=cross(offset,motion)/denominator;
      if (t>-EPSILON && t<1+EPSILON && u>=-EPSILON && u<=1+EPSILON) {
        cuts.push(Math.max(0,Math.min(1,t)));
      }
    }
  }
  return cuts.sort((a,b)=>a-b).filter((value,index,values)=>!index || value-values[index-1]>EPSILON);
}

function nearestWalkable(point) {
  if (!finitePoint(point)) return {...PRISM.spawn};
  if (walkable(point)) return {...point};
  let closest={...PRISM.spawn},best=Infinity;
  for (const polygon of WALKABLE) {
    for (let i=0;i<polygon.length;i++) {
      const a=polygon[i],b=polygon[(i+1)%polygon.length],edge=subtract(b,a);
      const offset=subtract(point,a);
      const t=Math.max(0,Math.min(1,(offset.x*edge.x+offset.y*edge.y)/(edge.x*edge.x+edge.y*edge.y)));
      const candidate=mix(a,b,t),distance=Math.hypot(point.x-candidate.x,point.y-candidate.y);
      if (distance<best) { closest=candidate;best=distance; }
    }
  }
  return closest;
}

export function clampPrismPoint(point,previous=PRISM.spawn) {
  const origin=nearestWalkable(previous);
  if (!finitePoint(point)) return origin;
  const cuts=segmentCuts(origin,point,WALKABLE);
  for (let i=0;i<cuts.length-1;i++) {
    if (!walkable(mix(origin,point,(cuts[i]+cuts[i+1])/2))) return mix(origin,point,cuts[i]);
  }
  return {x:point.x,y:point.y};
}

export function createPrismPractice() {
  const fresh=()=>({
    phase:'approach',entered:false,elapsedMs:0,partyMs:0,phraseIndex:0,
    activeZone:-1,charges:[0,0,0],progress:0,goal:3,complete:false,celebrationMs:0,
  });
  let state=fresh(),status='ready';

  const keys=(value,names)=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&
    [Object.prototype,null].includes(Object.getPrototypeOf(value))&&Object.keys(value).length===names.length&&names.every(name=>Object.hasOwn(value,name));
  const duration=value=>Number.isFinite(value)&&value>=0&&value<=7*24*60*60*1000;
  function restore(snapshot) {
    if(!keys(snapshot,['version','kind','status','state'])||snapshot.version!==1||snapshot.kind!=='prism-party'||!['ready','playing','paused','complete','ended'].includes(snapshot.status))return false;
    const s=snapshot.state;
    if(!keys(s,Object.keys(fresh()))||!['approach','party','celebrating','complete'].includes(s.phase)||typeof s.entered!=='boolean'||typeof s.complete!=='boolean'||s.goal!==3)return false;
    if(!['elapsedMs','partyMs','celebrationMs'].every(key=>duration(s[key]))||s.celebrationMs>PRISM.celebrationMs||s.elapsedMs+EPSILON<s.partyMs+s.celebrationMs||!Number.isSafeInteger(s.phraseIndex)||s.phraseIndex<0)return false;
    if(!Array.isArray(s.charges)||s.charges.length!==3||Object.keys(s.charges).length!==3||![0,1,2].every(index=>Object.hasOwn(s.charges,index)&&Number.isFinite(s.charges[index])&&s.charges[index]>=0&&s.charges[index]<=PRISM.chargeMs))return false;
    if(s.progress!==s.charges.filter(value=>value===PRISM.chargeMs).length||s.charges.reduce((sum,value)=>sum+value,0)>s.partyMs+EPSILON)return false;
    if(s.entered!==(s.phase!=='approach')||s.complete!==(s.phase==='complete')||(snapshot.status==='complete')!==s.complete)return false;
    const final=s.phase==='celebrating'||s.phase==='complete';
    // A face cannot receive movement before its first eight-second cue. This
    // also rejects impossible instant wins while retaining arbitrary later loops.
    if(s.charges.some((value,index)=>value>Math.max(0,s.partyMs-index*PRISM.phraseMs)+EPSILON))return false;
    const phrase=Math.floor(s.partyMs/PRISM.phraseMs);
    if(s.phraseIndex!==phrase&&!(final&&s.partyMs===phrase*PRISM.phraseMs&&s.phraseIndex===phrase-1))return false;
    if(s.phase==='approach'&&(s.partyMs!==0||s.phraseIndex!==0||s.activeZone!==-1||s.progress!==0||s.charges.some(Boolean)||s.celebrationMs!==0))return false;
    if(s.phase==='party'){
      if(!Number.isInteger(s.activeZone)||s.activeZone<0||s.activeZone>2||s.progress===3||s.celebrationMs!==0)return false;
      if(s.phraseIndex<3&&s.activeZone!==s.phraseIndex||s.progress===0&&s.activeZone!==s.phraseIndex%3)return false;
    }
    if(final&&(s.progress!==3||s.activeZone!==-1||s.partyMs<2*PRISM.phraseMs+PRISM.chargeMs-EPSILON))return false;
    if(s.phase==='celebrating'&&s.celebrationMs>=PRISM.celebrationMs||s.phase==='complete'&&s.celebrationMs!==PRISM.celebrationMs)return false;
    if(snapshot.status==='ready'&&(s.phase!=='approach'||s.elapsedMs!==0))return false;
    state=structuredClone(s);status=snapshot.status==='playing'?'paused':snapshot.status;return true;
  }

  function step({player,previous,deltaMs,drivenSpeed}={}) {
    const events=[];
    if (status!=='playing' || !Number.isFinite(deltaMs) || deltaMs<=0) return events;
    const duration=Math.min(PRISM.maxDeltaMs,deltaMs);
    const finiteMotion=finitePoint(player)&&finitePoint(previous);
    const clipped=finiteMotion?clampPrismPoint(player,previous):null;
    const validMotion=finiteMotion && walkable(previous) &&
      Math.hypot(clipped.x-player.x,clipped.y-player.y)<EPSILON;
    // A moving crowd can push an idle player. When the controller supplies
    // driven speed, only intentional travel may charge a face. Entry remains
    // geometric so this optional signal cannot strand someone on the ramp.
    const driven=drivenSpeed===undefined || Number.isFinite(drivenSpeed)&&drivenSpeed>PRISM.movementThreshold;
    const moving=driven && validMotion && Math.hypot(player.x-previous.x,player.y-previous.y)*1000/duration>PRISM.movementThreshold;
    let time=0;

    if (state.phase==='approach') {
      let crossing=null;
      if (validMotion && previous.y>=PRISM.entryY && player.y<=PRISM.entryY && player.y<previous.y && pointInPrismFloor(player)) {
        const fraction=(PRISM.entryY-previous.y)/(player.y-previous.y);
        const entry=mix(previous,player,fraction);
        if (entry.x>=PRISM_RAMP.minX && entry.x<=PRISM_RAMP.maxX) crossing=fraction;
      }
      if (crossing===null) { state.elapsedMs+=duration;return events; }
      time=duration*crossing;
      state.elapsedMs+=time;
      state.phase='party';state.entered=true;state.activeZone=0;
      events.push({type:'entered'});
    }

    const spatialCuts=validMotion?segmentCuts(previous,player,PRISM_ZONES.map(zone=>zone.points)).map(cut=>cut*duration):[];
    while (time<duration-EPSILON && status==='playing') {
      if (state.phase==='celebrating') {
        const amount=Math.min(duration-time,PRISM.celebrationMs-state.celebrationMs);
        state.celebrationMs+=amount;state.elapsedMs+=amount;time+=amount;
        if (state.celebrationMs>=PRISM.celebrationMs-EPSILON) {
          state.celebrationMs=PRISM.celebrationMs;
          state.phase='complete';state.complete=true;status='complete';
          events.push({type:'complete'});
        }
        continue;
      }

      const phraseEnd=(state.phraseIndex+1)*PRISM.phraseMs;
      const spatialEnd=spatialCuts.find(cut=>cut>time+EPSILON)??duration;
      let end=Math.min(duration,spatialEnd,time+phraseEnd-state.partyMs);
      const zone=validMotion?prismZoneAt(mix(previous,player,(time+end)/(2*duration))):-1;
      const charging=moving && zone===state.activeZone && state.charges[zone]<PRISM.chargeMs;
      if (charging) end=Math.min(end,time+PRISM.chargeMs-state.charges[zone]);
      const amount=end-time;
      state.elapsedMs+=amount;state.partyMs+=amount;time=end;

      if (charging) {
        state.charges[zone]+=amount;
        if (state.charges[zone]>=PRISM.chargeMs-EPSILON) {
          state.charges[zone]=PRISM.chargeMs;state.progress++;
          events.push({type:'charged',zone});
          if (state.progress===state.goal) {
            state.phase='celebrating';state.activeZone=-1;
            events.push({type:'finale'});
          }
        }
      }
      if (state.phase==='party' && state.partyMs>=phraseEnd-EPSILON) {
        state.partyMs=phraseEnd;state.phraseIndex++;
        for (let offset=1;offset<=PRISM_ZONES.length;offset++) {
          const next=(state.activeZone+offset)%PRISM_ZONES.length;
          if (state.charges[next]<PRISM.chargeMs) { state.activeZone=next;break; }
        }
        events.push({type:'phrase',zone:state.activeZone});
      }
    }
    return events;
  }

  return {
    get state(){return state;},get status(){return status;},
    capture(){return {version:1,kind:'prism-party',status,state:structuredClone(state)};},
    restore,
    start(){state=fresh();status='playing';},
    reset(){state=fresh();status='ready';},
    pause(){if(status==='playing')status='paused';},
    resume(){if(status==='paused')status='playing';},
    finish(){if(status==='playing'||status==='paused')status='ended';},
    step,
  };
}
