export const FIT_FACINGS=[['down','Front'],['up','Back'],['right','Right'],['left','Left']];
export const FIT_POSES=['rest','dance','walk','run'];
export const FIT_STAFFS=[{id:'none',name:'No earned staff'},{id:'lantern',name:'Lantern staff',kind:'lantern-on'},{id:'cheese',name:'Cheese staff',kind:'toast'},{id:'chicken',name:'Golden chicken',kind:'chicken',size:27,colour:0xffd882,sparkles:true}];
export function wardrobeFitRequested(env={},search=''){
 const params=new URLSearchParams(search);
 return env.DEV===true&&params.has('rehearsal')&&params.has('wardrobe-fit');
}
export function fitPoseInput(pose='walk',facing='down',phase=0){
 if(!FIT_POSES.includes(pose))pose='walk';
 if(!FIT_FACINGS.some(([id])=>id===facing))facing='down';
 const count=pose==='rest'?1:6,position=((Number.isFinite(phase)?phase:0)%count+count)%count;
 const fps=pose==='run'?12:8;
 return {count,position,elapsed:(position+.000001)*1000/fps,reduced:pose==='rest',
  dancing:pose==='dance',motion:{facing,speed:pose==='run'?450:pose==='walk'?300:0,sprinting:pose==='run',gait:(position+.000001)/6}};
}
