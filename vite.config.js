import { defineConfig,loadEnv } from 'vite';
import {editionIdFromEnv,getEdition} from './src/editions/registry.js';
import {editionAssetsPlugin} from './build/edition-assets.js';

export default defineConfig(({mode})=>{
 const id=editionIdFromEnv({...loadEnv(mode,process.cwd(),'VITE_'),...process.env}),edition=getEdition(id);
 return {
  // Relative assets support separate edition previews and Pages subpaths.
  base:'./',publicDir:false,
  // Concurrent edition previews optimize different entry graphs.
  cacheDir:`node_modules/.vite/${id}`,
  plugins:[editionAssetsPlugin(id),{name:'edition-document',transformIndexHtml:html=>html.replaceAll('__EDITION_TITLE__',edition.brand.title).replaceAll('__EDITION_WORDMARK__',id==='smf'?'SHAMBHALA':'FESTIVAL')}],
 };
});
