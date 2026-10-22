// Identity belongs to optional analytics only; scores never consume it.
export function createConsent({storage,uuid=()=>crypto.randomUUID()}) {
  return {
    enabled:()=>storage.profile.playtestConsent==='accepted',
    identity:()=>storage.profile.playtestConsent==='accepted'?storage.profile.playtestIdentity:null,
    set(value){
      if(!['accepted','declined'].includes(value))return {accepted:false,persisted:false};
      const identity=value==='accepted'?(storage.profile.playtestIdentity||uuid()):null;
      return storage.savePlaytestConsent(value,identity);
    },
  };
}
