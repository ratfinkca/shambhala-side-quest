// Imported only by the DEV venue practice entry, never by either public build.
export const LIVING_ROOM_ART_KEY='smf-living-room-art-v1';
export const FRACTAL_ART_KEY='smf-fractal-art-v1';
export const GROVE_ART_KEY='smf-grove-art-v1';
export const AMP_ART_KEY='smf-amp-art-v1';
export const PAGODA_ART_KEY='smf-pagoda-art-v1';
export const VILLAGE_ART_KEY='smf-village-art-v1';
export function preloadSMFVenueArt(scene){
 if(!scene.textures.exists(LIVING_ROOM_ART_KEY)){
  scene.load.image(LIVING_ROOM_ART_KEY,new URL('./assets/living-room-v1.jpg',import.meta.url).href);
 }
 if(!scene.textures.exists(FRACTAL_ART_KEY)){
  scene.load.image(FRACTAL_ART_KEY,new URL('./assets/fractal-forest-v1.jpg',import.meta.url).href);
 }
 if(!scene.textures.exists(GROVE_ART_KEY)){
  scene.load.image(GROVE_ART_KEY,new URL('./assets/grove-v1.jpg',import.meta.url).href);
 }
 if(!scene.textures.exists(AMP_ART_KEY)){
  scene.load.image(AMP_ART_KEY,new URL('./assets/amp-v1.jpg',import.meta.url).href);
 }
 if(!scene.textures.exists(PAGODA_ART_KEY)){
  scene.load.image(PAGODA_ART_KEY,new URL('./assets/pagoda-v1.jpg',import.meta.url).href);
 }
 if(!scene.textures.exists(VILLAGE_ART_KEY)){
  scene.load.image(VILLAGE_ART_KEY,new URL('./assets/village-v1.jpg',import.meta.url).href);
 }
}
