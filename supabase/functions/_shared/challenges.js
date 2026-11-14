// Versioned run selection shared by browser and score services.
export const CHALLENGES=Object.freeze({
 'first-timer':Object.freeze({id:'first-timer',name:'First-timer',crowdScale:.7,targetScale:.7,friendPasses:2,crowdCap:16}),
 'been-around':Object.freeze({id:'been-around',name:'Been-around',crowdScale:1,targetScale:1,friendPasses:4,crowdCap:22}),
 'seasoned-vet':Object.freeze({id:'seasoned-vet',name:'Seasoned-vet',crowdScale:1.3,targetScale:1.3,friendPasses:6,crowdCap:28}),
});
export const CHALLENGE_IDS=Object.freeze(Object.keys(CHALLENGES));
export const DEFAULT_CHALLENGE='been-around';
export const isChallenge=value=>typeof value==='string'&&Object.hasOwn(CHALLENGES,value);
export const normalizeChallenge=value=>isChallenge(value)?value:DEFAULT_CHALLENGE;
