import {drawCandyColours} from './candy-colours.js';
import {createPixelProp,setPixelProp} from './pixel-art/props.js';

export class MysteryRenderer {
 constructor(scene){
  this.pickup=scene.add.container(0,0).setDepth(15).setVisible(false);
  this.art=createPixelProp(scene,'candy-0',{size:48});this.pickup.add(this.art);
  // Behind hazards, pickups and characters; never distort the HUD or hitboxes.
  this.waves=scene.add.graphics().setDepth(.3).setVisible(false);
  this.placed=false;
 }
 reset(wrapper){
  this.placed=false;this.pickup.setVisible(false).setScale(1);this.waves.clear().setVisible(false);
  this.art.setPosition(0,0);setPixelProp(this.art,`candy-${wrapper.colour}`);
  this.pickup.setRotation(0);
 }
 update(m,reduced){
  this.pickup.setVisible(m.phase==='available'&&this.placed);
  // Discrete glints/bob preserve the pixel grid; no stretching of wrappers.
  this.pickup.setScale(1);this.art.setPosition(0,reduced?0:Math.round(Math.sin(m.elapsedMs*.003)*2));
  this.waves.clear().setVisible(m.effect==='waves'&&m.effectMs>0);
  drawCandyColours(this.waves,m,reduced);
 }
}
