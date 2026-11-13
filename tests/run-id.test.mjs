import test from 'node:test';
import assert from 'node:assert/strict';
import {createRunId} from '../src/run-id.js';
test('run IDs use the native secure-context UUID generator when available',()=>{
 assert.equal(createRunId({randomUUID:()=> 'native-id'}),'native-id');
});
test('LAN phone previews generate valid random UUIDs without secure-context randomUUID',()=>{
 let seed=0;
 const crypto={getRandomValues(bytes){for(let i=0;i<bytes.length;i++)bytes[i]=++seed;return bytes;}};
 const first=createRunId(crypto),second=createRunId(crypto);
 assert.match(first,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
 assert.notEqual(first,second);assert.equal(first,'01020304-0506-4708-890a-0b0c0d0e0f10');
});
