import {PERKS} from './run.js';
import {RANKS,ACHIEVEMENTS,rankFor,achievementValue} from './progression.js';
import {STAGE_VARIATIONS} from './stage-variations.js';
import {WARDROBE} from './wardrobe.js';
export const rewardName=key=>{const [category,id]=key.split(':');return category==='perk'?`${PERKS[id]?.name||''} perk`:WARDROBE[category]?.find(o=>o.id===id)?.name||'';};
export function renderEndlessRewards(progress){
 const descriptions={endless4:'A little colony of luminous caps. Spores drift just above your head.',remix:'A cassette for your next chapter. Turning reels and a ribbon that dances during drops.',layouts:'Midnight threads, alive with teal, violet and gold mycelium.',endless12:'Two soft aurora ribbons. A little brighter when the bass drops.'};
 const icons={endless4:'♧',remix:'▣',layouts:'⌁',endless12:'≋'};
 return `<section class="endless-rewards" aria-label="Endless souvenirs"><p class="menu-eyebrow">SOUVENIRS FROM THE LONG WAY HOME</p><h3>Endless souvenirs</h3><p>Best Endless run: ${progress.endless.bestCleared} stages cleared</p><p class="menu-footnote">Earned at stage clear. No score saving or online posting needed. Saved on this device.</p><div class="reward-grid">${ACHIEVEMENTS.filter(a=>a.endless).map(a=>{
  const value=Math.min(achievementValue(progress,a),a.target),earned=value>=a.target,name=rewardName(a.reward);
  return `<article class="souvenir-card ${earned?'earned':''}"><span class="souvenir-mark" aria-hidden="true">${icons[a.id]}</span><p class="souvenir-state">${earned?'Earned':'Locked'} · ${name}</p><h4>${a.name}</h4><p>${a.description}.</p><progress aria-label="${a.name} progress" value="${value}" max="${a.target}"></progress><small>${value} / ${a.target}${a.id==='endless4'||a.id==='endless12'?' · best run':''}</small><p class="souvenir-detail">${descriptions[a.id]}</p><button class="menu-button" data-action="preview-outfit" data-value="${a.reward}">Preview ${name}</button></article>`;
 }).join('')}</div><details class="layout-collection"><summary>Layout collection · ${progress.endless.layouts.length} / 6</summary><ul>${STAGE_VARIATIONS.map(v=>`<li>${progress.endless.layouts.includes(v.id)?'✓ Cleared':'○ Still to clear'} · ${v.name}</li>`).join('')}</ul><p class="menu-footnote">Variants begin at stage 4. Reach stage 9 to encounter all six; cleared layouts carry across runs.</p></details></section>`;
}
export function renderPassport(progress){
 const rank=rankFor(progress),next=RANKS[rank+1];
 return `<section class="passport" aria-label="Festival passport"><h3>${RANKS[rank].name}</h3><p>${progress.xp} Rave XP${next?` · Next: ${next.name} at ${next.xp}`:' · Top rank'}</p>${next?`<progress aria-label="Rank progress" value="${progress.xp-RANKS[rank].xp}" max="${next.xp-RANKS[rank].xp}"></progress>`:''}<details><summary>Achievements & rewards</summary><ul>${ACHIEVEMENTS.filter(a=>!a.endless).map(a=>`<li><strong>${a.name}</strong> · ${Math.min(progress.totals[a.id],a.target)} / ${a.target}<br><small>${a.description}<br>${progress.totals[a.id]>=a.target?'Earned':'Reward'}: ${rewardName(a.reward)}</small></li>`).join('')}</ul></details><small>Pool Noodle joins your perk choices at Forest Wanderer; Moth Charm at Dancefloor Regular. Existing players retain those four. Crowd Surfer: 300 XP · Bass Battery: 650 XP · Encore: 1,200 XP · Sweet Tooth: 2,000 XP. Saved on this device.</small></section>`;
}
export function renderReward(result){
 if(!result)return '';
 return `<section class="passport reward-reveal" aria-label="Stage rewards"><h3>+${result.xp} Rave XP</h3>${result.rewards.length?`<p>New festival magic!</p><ul>${result.rewards.map(key=>`<li>${rewardName(key)}</li>`).join('')}</ul>`:'<p>Another step toward your next unlock.</p>'}${result.persisted?'':'<p>Browser storage unavailable: progress lasts for this session.</p>'}</section>`;
}
