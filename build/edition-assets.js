import {fileURLToPath} from 'node:url';
import {posix} from 'node:path';
import {readFile} from 'node:fs/promises';
import {getEdition} from '../src/editions/registry.js';
const themes=['forest-freakout','moonlit-mycelium','neon-field-trip'];
const shared=Object.freeze(['fonts/LilitaOne-Regular.ttf','fonts/LilitaOne-OFL.txt','fonts/DMSans.ttf','fonts/DMSans-OFL.txt','playtest-data.html',...themes.flatMap(id=>['backdrop','boots','moth','noodle','bracelet'].map(name=>`themes/${id}/${name}.webp`))]);
const publicRoot=fileURLToPath(new URL('../public/',import.meta.url)).replaceAll('\\','/');
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
   let urlPath;try{urlPath=posix.normalize(decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.statusCode=400;res.end();return;}
   let path;
   if(urlPath.startsWith('/public/'))path=urlPath.slice('/public/'.length);
   else if(urlPath.startsWith('/@fs/')){
    let absolute='/'+urlPath.slice('/@fs/'.length).replace(/^\/+/, '');
    if(/^\/[A-Za-z]:\//.test(absolute))absolute=absolute.slice(1);
    if(absolute.startsWith(publicRoot))path=absolute.slice(publicRoot.length);
   }else if(/^\/(themes|fonts)\//.test(urlPath)||urlPath==='/playtest-data.html')path=urlPath.slice(1);
   if(path===undefined){next();return;}
   if(!allowed.has(path)){res.statusCode=404;res.end('Asset not available in this edition');return;}
   try{res.setHeader('Content-Type',mime(path));res.end(await readFile(source(path)));}catch{res.statusCode=404;res.end();}
  });},
 };
}
