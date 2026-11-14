import {CHARACTER_OPTIONS,CHARACTER_PRESETS,normalizeAppearance} from './wardrobe.js';

export const CHARACTER_FACINGS=[{id:'down',name:'Front'},{id:'right',name:'Right'},{id:'up',name:'Back'},{id:'left',name:'Left'}];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const same=(a,b)=>Object.keys(CHARACTER_OPTIONS).every(key=>a[key]===b[key]);
const name=(key,id)=>CHARACTER_OPTIONS[key].find(option=>option.id===id)?.name??id;
const valueAttributes=id=>`data-value="${esc(id)}" data-id="${esc(id)}"`;

export function renderCharacterControls(outfit){
 const appearance=normalizeAppearance(outfit?.appearance);
 return `<section class="character-identity" aria-labelledby="character-identity-title"><h3 id="character-identity-title">Start with a look</h3><p class="character-help">Pick a starting point, then make it yours. Your clothes and accessories stay equipped.</p><div class="character-presets">${CHARACTER_PRESETS.map(preset=>`<button type="button" class="menu-button character-preset" data-action="character-preset" ${valueAttributes(preset.id)} aria-pressed="${same(appearance,preset.appearance)}"><span class="character-portrait" data-character-portrait="${esc(preset.id)}" aria-hidden="true"></span><strong>${esc(preset.name)}</strong><small>${esc(name('hair',preset.appearance.hair))} · ${esc(name('face',preset.appearance.face))}</small></button>`).join('')}</div><div class="character-features">${[['face','Face'],['hair','Hair']].map(([key,label])=>`<label>${label}<select data-appearance="${key}" aria-label="${label}">${CHARACTER_OPTIONS[key].map(option=>`<option value="${esc(option.id)}"${appearance[key]===option.id?' selected':''}>${esc(option.name)}</option>`).join('')}</select></label>`).join('')}</div><fieldset class="character-skin"><legend>Skin tone</legend><div>${CHARACTER_OPTIONS.skinTone.map(option=>`<button type="button" data-action="character-skin" ${valueAttributes(option.id)} aria-label="${esc(option.name)} skin tone" aria-pressed="${appearance.skinTone===option.id}"><span class="character-swatch" style="--skin-swatch:${esc(option.color)}" aria-hidden="true"></span><span>${esc(option.name)}</span></button>`).join('')}</div></fieldset><div class="character-angles" role="group" aria-label="Character preview angle"><span>Preview angle</span>${CHARACTER_FACINGS.map(option=>`<button type="button" data-action="character-facing" ${valueAttributes(option.id)} aria-pressed="${option.id==='down'}">${option.name}</button>`).join('')}</div><p class="character-look-name" data-character-summary>${esc(characterLookName(appearance))}</p></section>`;
}

function characterLookName(appearance){return CHARACTER_PRESETS.find(preset=>same(appearance,preset.appearance))?.name??'Custom look';}

export function updateCharacterControls(root,outfit,{facing='down'}={}){
 const appearance=normalizeAppearance(outfit?.appearance);
 root.querySelectorAll('[data-appearance]').forEach(node=>{node.value=appearance[node.dataset.appearance];});
 root.querySelectorAll('[data-action="character-preset"]').forEach(node=>{
  const preset=CHARACTER_PRESETS.find(item=>item.id===(node.dataset.value??node.dataset.id));
  node.setAttribute('aria-pressed',String(Boolean(preset&&same(appearance,preset.appearance))));
 });
 root.querySelectorAll('[data-action="character-skin"]').forEach(node=>node.setAttribute('aria-pressed',String((node.dataset.value??node.dataset.id)===appearance.skinTone)));
 root.querySelectorAll('[data-action="character-facing"]').forEach(node=>node.setAttribute('aria-pressed',String((node.dataset.value??node.dataset.id)===facing)));
 const summary=root.querySelector('[data-character-summary]');if(summary)summary.textContent=characterLookName(appearance);
}
