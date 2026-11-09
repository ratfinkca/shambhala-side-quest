// Imported only by the DEV venue practice entry, never by either public build.
export const FRACTAL_ART_KEY='smf-fractal-art-v1';
export function preloadSMFVenueArt(scene){
 if(!scene.textures.exists(FRACTAL_ART_KEY)){
  scene.load.image(FRACTAL_ART_KEY,new URL('./assets/fractal-forest-v1.jpg',import.meta.url).href);
 }
}
