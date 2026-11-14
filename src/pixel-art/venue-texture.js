// Phaser's nearest-neighbor texture mode. Keep this local to pixel plates;
// camera movement, geometry, screen effects and canvas dimensions stay intact.
export function pixelVenueTexture(scene,key){
 scene.textures?.get?.(key)?.setFilter?.(1);
 return key;
}
