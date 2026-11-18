import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync('dist/_worker.js','utf8');
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const env={ASSETS:{fetch:async()=>new Response(new Uint8Array([0,1,2,3,4,5,6,7,8,9]),{headers:{'Content-Type':'video/mp4','ETag':'"test"','Content-Length':'10'}})}};
for(const [range,status,expected] of [['bytes=2-4',206,[2,3,4]],['bytes=7-',206,[7,8,9]],['bytes=-2',206,[8,9]],['bytes=20-',416,[]],['bytes=8-99',206,[8,9]],['bytes=-0',416,[]]]){
 const r=await worker.fetch(new Request('https://test/assets/test.mp4',{headers:{Range:range}}),env);assert.equal(r.status,status);assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],expected);
}
console.log('Range tests passed: bounded, open, suffix, clamped and invalid ranges');
