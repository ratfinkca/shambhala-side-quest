import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePlayerName,validatePlayerName,displayNameFor} from '../supabase/functions/_shared/player-name.js';

test('rave names normalize Unicode and spaces while retaining inclusive names',()=>{
 assert.equal(normalizePlayerName('  Ｍoon   Dancer  '),'Moon Dancer');
 for(const value of ['Zoë','東京','李 雷','Moon-Dancer',"O'Neil",'Bass_42','Scunthorpe','Classic','Cassandra'])assert.equal(validatePlayerName(value).ok,true,value);
 assert.deepEqual(validatePlayerName('  Cafe\u0301  '),{ok:true,name:'Café',error:null});
});
test('rave names reject malformed, oversized and inappropriate names including common evasions',()=>{
 for(const value of [null,42,'','A','abcdefghijklmnopq','<b>Nice</b>','Hi\u0000','Hi\u202e','Hi\u200b','Hi\nThere','💚💚','f_u_c_k','F U C K','sh1t','b1tch','f4gg0t','fuck123','n1gg3r'])assert.equal(validatePlayerName(value).ok,false,String(value));
 assert.equal(validatePlayerName('f'.repeat(100000)).ok,false);
 assert.equal(validatePlayerName('Moon Dancer').error,null);
});
test('display names use valid snapshots with legacy initials fallback',()=>{
 assert.equal(displayNameFor({displayName:'Moon Dancer',initials:'OLD'}),'Moon Dancer');
 assert.equal(displayNameFor({initials:'OLD'}),'OLD');
 assert.equal(displayNameFor({displayName:'<svg>',initials:'OLD'}),'OLD');
 assert.equal(displayNameFor({displayName:'f_u_c_k'}),'Guest');
});
test('filters separated profanity beside a normal word and rejects invisible letter fillers',()=>{
 for(const value of ['f_u_c_k Moon','a55','f4gg0t','n1gg3r','ᅠᅠ','ㅤㅤ'])assert.equal(validatePlayerName(value).ok,false,value);
 for(const value of ['Classic Moon','Scunthorpe','Cassandra'])assert.equal(validatePlayerName(value).ok,true,value);
});
test('number substitution stays blocked with an added numeric prefix or suffix',()=>{
 for(const value of ['sh1t42','n1gg3r123','99f4gg0t99','123b1tch','xx_f_u_c_k_xx'])assert.equal(validatePlayerName(value).ok,false,value);
 for(const value of ['Bass42','99Dancer','Classic_123'])assert.equal(validatePlayerName(value).ok,true,value);
});
