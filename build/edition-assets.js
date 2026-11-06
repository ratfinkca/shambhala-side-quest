import {readFile} from 'node:fs/promises';
import {getEdition} from '../src/editions/registry.js';
const themes=['forest-freakout','moonlit-mycelium','neon-field-trip'];
const shared=Object.freeze(['fonts/LilitaOne-Regular.ttf','fonts/LilitaOne-OFL.txt','fonts/DMSans.ttf','fonts/DMSans-OFL.txt','playtest-data.html',...themes.flatMap(id=>['backdrop','boots','moth','noodle','bracelet'].map(name=>`themes/${id}/${name}.webp`))]);
const mime=path=>path.endsWith('.webp')?'image/webp':path.endsWith('.ttf')?'font/ttf':path.endsWith('.html')?'text/html; charset=utf-8':'text/plain; charset=utf-8';
export function assetsForEdition(id){
 const edition=getEdition(id);
 return [...shared,...Object.values(edition.brand.titleArtByTheme)];
}
export function editionAssetsPlugin(id){
 const assets=assetsForEdition(id),allowed=new Set(assets);
 const source=path=>new URL('../public/'+path,import.meta.url);
 return {name:'edition-public-assets',
  async generateBundle(){for(const fileName of assets)this.emitFile({type:'asset',fileName,source:await readFile(source(fileName))});},
  configureServer(server){server.middlewares.use(async(req,res,next)=>{
   let path;try{path=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1);}catch{res.statusCode=400;res.end();return;}
   if(!allowed.has(path)){
    if(/^(themes|fonts)\//.test(path)||path==='playtest-data.html'){res.statusCode=404;res.end('Asset not available in this edition');return;}
    next();return;
   }
   try{res.setHeader('Content-Type',mime(path));res.end(await readFile(source(path)));}catch{res.statusCode=404;res.end();}
  });},
 };
}
