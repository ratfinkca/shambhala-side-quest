import {CHARACTER_PRESETS} from './wardrobe.js';
import {characterPortrait} from './pixel-art/actor-heads.js';

const portraits=new Map();
function portraitURL(preset){
 if(!portraits.has(preset.id))portraits.set(preset.id,characterPortrait(preset.appearance,{facing:'front',scale:3}).then(canvas=>canvas.toDataURL()).catch(error=>{portraits.delete(preset.id);throw error;}));
 return portraits.get(preset.id);
}

// A failed thumbnail never blocks selection, saving, or the real avatar preview.
export function mountCharacterPortraits(root){
 const work=[];
 root.querySelectorAll('[data-character-portrait]').forEach(node=>{
  if(node.childElementCount||node.dataset.loading)return;
  const preset=CHARACTER_PRESETS.find(item=>item.id===node.dataset.characterPortrait);if(!preset)return;
  node.dataset.loading='true';
  work.push(portraitURL(preset).then(url=>{
   if(!node.isConnected)return;
   const image=document.createElement('img');image.alt='';image.src=url;image.draggable=false;node.replaceChildren(image);
  }).catch(()=>{}).finally(()=>{delete node.dataset.loading;}));
 });
 return Promise.all(work);
}
