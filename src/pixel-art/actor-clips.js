/** The generated front/back walks repeat the same foot's lift. They cannot be
 * repaired by reordering. Build an intentional alternate half-cycle by mirroring
 * three reviewed poses. Sideways rows are baked from generated component art
 * with explicit foot trajectories and an exact half-cycle offset between legs.
 * Pose mirroring is separate from travel-facing mirroring and wearable anchors.
 */
const alternating=(row,fps,half)=>({row,fps,order:[...half,...half],mirror:[false,false,false,true,true,true]});
export const ACTOR_CLIPS={
 idle:{row:0,fps:6,order:[0,1,2,3,4,5]},
 dance:{row:1,fps:8,order:[0,1,2,3,4,5]},
 walkDown:alternating(2,8,[0,1,2]),
 walkRight:{row:3,fps:8,order:[0,1,2,3,4,5]},
 walkUp:alternating(4,8,[0,1,2]),
 runDown:alternating(5,12,[3,0,1]),
 runRight:{row:6,fps:12,order:[0,1,2,3,4,5]},
 runUp:alternating(7,12,[0,5,2]),
 restRight:{row:8,fps:0,order:[0]},
};
export function locomotionCadence(speed,sprinting,{walkSpeed=300,runSpeed=450}={}){
 if(!Number.isFinite(speed)||speed<=1)return 0;
 const base=sprinting?12:8,reference=sprinting?runSpeed:walkSpeed;
 return base*Math.min(1.25,Math.max(.4,speed/reference));
}
export function orderedPose(clip,phase){
 const spec=ACTOR_CLIPS[clip]??ACTOR_CLIPS.idle;
 const index=((Math.floor(Math.max(0,phase)*spec.order.length)%spec.order.length)+spec.order.length)%spec.order.length;
 return {index:spec.order[index],row:spec.row,step:index,mirror:Boolean(spec.mirror?.[index])};
}
