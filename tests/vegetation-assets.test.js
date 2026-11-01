import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {nearbyTreeIndices} from '../src/scanned-trees.js';
test('reduced scanned tree is self-contained, bounded and traceable to its verified CC0 source',()=>{
 const meta=JSON.parse(readFileSync('public/vegetation/sources.json'));assert.equal(meta.license,'CC0-1.0');assert.equal(meta.authors['Rico Cilliers'],'All');assert.ok(meta.originals.every(f=>f.sha256&&f.md5));
 for(const f of meta.derived){const bytes=readFileSync('public/'+f.path);assert.equal(bytes.length,f.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);}
 const b=readFileSync('public/vegetation/tree.glb');assert.equal(b.readUInt32LE(0),0x46546c67);const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert.ok(gltf.buffers.every(b=>!b.uri));assert.ok(gltf.images.every(i=>i.bufferView!==undefined));
 const triangles=gltf.meshes.reduce((n,m)=>n+m.primitives.reduce((s,p)=>s+gltf.accessors[p.indices].count/3,0),0);assert.equal(triangles,meta.processing.triangles);assert.ok(triangles<180000&&triangles>50000);
 const atlas=readFileSync('public/vegetation/tree-atlas.png');assert.equal(atlas.readUInt32BE(16),2048);assert.equal(atlas.readUInt32BE(20),512);
});

test('detailed tree budget ignores trees behind the camera and outside the nearby radius',()=>{const trees=[{x:0,z:-12},{x:1,z:2},{x:0,z:7},{x:0,z:40}];assert.deepEqual(nearbyTreeIndices(trees,{x:0,z:-8},{x:0,z:0}),[1,2]);});
