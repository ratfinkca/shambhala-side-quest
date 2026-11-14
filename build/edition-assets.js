import {fileURLToPath} from 'node:url';
import {posix} from 'node:path';
import {readFile} from 'node:fs/promises';
import {getEdition} from '../src/editions/registry.js';
const themes=['forest-freakout','moonlit-mycelium','neon-field-trip'];
const manifestFile='manifest.webmanifest';
const iconPath=size=>`icons/side-quest-${size}.png`;
const shared=Object.freeze([manifestFile,...[180,192,512].map(iconPath),'fonts/Silkscreen-Regular.ttf','fonts/Silkscreen-OFL.txt','fonts/LilitaOne-Regular.ttf','fonts/LilitaOne-OFL.txt','fonts/DMSans.ttf','fonts/DMSans-OFL.txt','playtest-data.html',...themes.flatMap(id=>['backdrop','boots','moth','noodle','bracelet'].map(name=>`themes/${id}/${name}.webp`))]);
const publicRoot=fileURLToPath(new URL('../public/',import.meta.url)).replaceAll('\\','/');
const mime=path=>path===manifestFile?'application/manifest+json':path.endsWith('.png')?'image/png':path.endsWith('.webp')?'image/webp':path.endsWith('.ttf')?'font/ttf':path.endsWith('.html')?'text/html; charset=utf-8':'text/plain; charset=utf-8';
export function assetsForEdition(id){
 const edition=getEdition(id);
 return [...shared,...(id==='smf'?['smf-playtest-data.html']:[]),...Object.values(edition.brand.titleArtByTheme)];
}
export function manifestForEdition(id){
 const edition=getEdition(id);
 // Manifest IDs resolve against the origin. Use one stable identity per
 // edition, while launching and scoping relative to its deployment directory.
 return {
  id:`/side-quest-${edition.id}`,
  name:edition.brand.title,
  short_name:edition.id==='smf'?'Shambhala SQ':'Festival SQ',
  start_url:'./',
  scope:'./',
  display:'standalone',
  orientation:'any',
  background_color:'#101917',
  theme_color:'#101917',
  icons:[192,512].map(size=>({src:`./${iconPath(size)}`,sizes:`${size}x${size}`,type:'image/png'})),
 };
}
export function editionAssetsPlugin(id){
 const assets=assetsForEdition(id),allowed=new Set(assets);
 const source=path=>path===manifestFile?JSON.stringify(manifestForEdition(id)):readFile(new URL('../public/'+path,import.meta.url));
 return {name:'edition-public-assets',
  async generateBundle(){for(const fileName of assets)this.emitFile({type:'asset',fileName,source:await source(fileName)});},
  configureServer(server){server.middlewares.use(async(req,res,next)=>{
   let urlPath;try{urlPath=posix.normalize(decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.statusCode=400;res.end();return;}
   let path;
   if(urlPath.startsWith('/public/'))path=urlPath.slice('/public/'.length);
   else if(urlPath.startsWith('/@fs/')){
    let absolute='/'+urlPath.slice('/@fs/'.length).replace(/^\/+/, '');
    if(/^\/[A-Za-z]:\//.test(absolute))absolute=absolute.slice(1);
    if(absolute.startsWith(publicRoot))path=absolute.slice(publicRoot.length);
   }else if(/^\/(themes|fonts|icons)\//.test(urlPath)||urlPath===`/${manifestFile}`||urlPath==='/playtest-data.html'||urlPath==='/smf-playtest-data.html')path=urlPath.slice(1);
   if(path===undefined){next();return;}
   if(!allowed.has(path)){res.statusCode=404;res.end('Asset not available in this edition');return;}
   try{res.setHeader('Content-Type',mime(path));res.end(await source(path));}catch{res.statusCode=404;res.end();}
  });},
 };
}
