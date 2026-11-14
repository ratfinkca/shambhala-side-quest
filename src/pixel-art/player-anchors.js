import {getAvatarAnchors} from '../Avatar.js';

// The physics dancer is an outer container. Sprite pose and bass shake live
// on its avatar child, so held props need anchors in the outer local space.
export function playerAvatarAnchors(scene){
 const avatar=scene.avatar??scene.dancer,anchors=getAvatarAnchors(avatar);
 const offset=avatar===scene.dancer?{x:0,y:0}:{x:Number.isFinite(avatar?.x)?avatar.x:0,y:Number.isFinite(avatar?.y)?avatar.y:0};
 const move=point=>point?{...point,x:point.x+offset.x,y:point.y+offset.y}:point;
 const headwear=anchors.headwear?{...move(anchors.headwear),crown:move(anchors.headwear.crown),brow:move(anchors.headwear.brow),ears:{near:move(anchors.headwear.ears?.near),far:move(anchors.headwear.ears?.far)}}:undefined;
 return {...anchors,...Object.fromEntries(['head','hand','feet'].map(key=>[key,move(anchors[key])])),headwear};
}
