// Browser/Edge contract. Names are public aliases, never account identifiers.
const MAX_RAW_LENGTH=128;
const forbidden=/[\p{Cc}\p{Cf}\p{Cs}\p{Default_Ignorable_Code_Point}]/u;
const allowed=/^[\p{L}\p{N} '_-]+$/u;
// Match words and explicitly joined evasions, not arbitrary substrings: e.g.
// Classic, Cassandra and Scunthorpe must remain valid names.
const blocked=new Set(['ass','fuck','fucks','fucker','fuckers','fucking','fuckyou','motherfucker','motherfuckers','motherfucking','shit','shits','shitty','shithead','bullshit','bitch','bitches','bitchy','cunt','cunts','asshole','assholes','bastard','bastards','dick','dicks','dickhead','cock','cocks','pussy','pussies','whore','whores','slut','sluts','nigger','niggers','nigga','niggas','faggot','faggots','fag','fags','retard','retards','retarded','kike','kikes','chink','chinks','spic','spics','heilhitler','hitler','nazi','nazis']);
const leet={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g'};
function inappropriate(name){
 const folded=name.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
 const translate=value=>value.replace(/[01345789]/g,c=>leet[c]);
 const variants=[folded,translate(folded),translate(folded.replace(/^[0-9]+|[0-9]+$/g,'')),folded.replace(/[0-9]/g,'')];
 return variants.some(value=>{
  const words=value.split(/[^a-z]+/).filter(Boolean);
  for(let start=0;start<words.length;start++){
   let joined='';for(let end=start;end<words.length;end++){joined+=words[end];if(blocked.has(joined))return true;}
  }
  return false;
 });
}

export function normalizePlayerName(value){
 if(typeof value!=='string'||value.length>MAX_RAW_LENGTH)return '';
 return value.normalize('NFKC').replace(/\p{Zs}+/gu,' ').trim();
}

export function validatePlayerName(value){
 const name=normalizePlayerName(value),fail=error=>({ok:false,name,error});
 if(typeof value!=='string'||value.length>MAX_RAW_LENGTH||forbidden.test(value))return fail('Use letters, numbers, spaces, hyphens, apostrophes or underscores.');
 if([...name].length<2||[...name].length>16)return fail('Choose a rave name with 2–16 characters.');
 if(!allowed.test(name)||!/[\p{L}\p{N}]/u.test(name))return fail('Use letters, numbers, spaces, hyphens, apostrophes or underscores.');
 if(inappropriate(name))return fail('Please choose a different rave name.');
 return {ok:true,name,error:null};
}

export function displayNameFor(row){
 const result=validatePlayerName(row?.displayName);
 return result.ok?result.name:typeof row?.initials==='string'&&/^[A-Z0-9]{3}$/.test(row.initials)?row.initials:'Guest';
}
