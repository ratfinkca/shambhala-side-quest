import {PERKS} from './run.js';
import {RANKS,ACHIEVEMENTS,rankFor} from './progression.js';
import {WARDROBE} from './wardrobe.js';
export const rewardName=key=>{const [category,id]=key.split(':');return category==='perk'?`${PERKS[id]?.name||''} perk`:WARDROBE[category]?.find(o=>o.id===id)?.name||'';};
export function renderPassport(progress){
 const rank=rankFor(progress),next=RANKS[rank+1];
 return `<section class="passport" aria-label="Festival passport"><h3>${RANKS[rank].name}</h3><p>${progress.xp} Rave XP${next?` · Next: ${next.name} at ${next.xp}`:' · Top rank'}</p>${next?`<progress aria-label="Rank progress" value="${progress.xp-RANKS[rank].xp}" max="${next.xp-RANKS[rank].xp}"></progress>`:''}<details><summary>Achievements & rewards</summary><ul>${ACHIEVEMENTS.map(a=>`<li><strong>${a.name}</strong> · ${Math.min(progress.totals[a.id],a.target)} / ${a.target}<br><small>${a.description}<br>${progress.totals[a.id]>=a.target?'Earned':'Reward'}: ${rewardName(a.reward)}</small></li>`).join('')}</ul></details><small>Pool Noodle joins your perk choices at Forest Wanderer; Moth Charm at Dancefloor Regular. Existing players retain those four. Crowd Surfer: 300 XP · Bass Battery: 650 XP · Encore: 1,200 XP · Sweet Tooth: 2,000 XP. Saved on this device.</small></section>`;
}
export function renderReward(result){
 if(!result)return '';
 return `<section class="passport reward-reveal" aria-label="Stage rewards"><h3>+${result.xp} Rave XP</h3>${result.rewards.length?`<p>New festival magic!</p><ul>${result.rewards.map(key=>`<li>${rewardName(key)}</li>`).join('')}</ul>`:'<p>Another step toward your next unlock.</p>'}${result.persisted?'':'<p>Browser storage unavailable: progress lasts for this session.</p>'}</section>`;
}
