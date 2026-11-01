import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {batchWorld} from '../src/batch-world.js';
test('world-encoded buildings with the same origin are split into independently cullable regions',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
 for(const z of [32,352]){const g=new THREE.BoxGeometry(2,2,2);g.translate(32,1,z);scene.add(new THREE.Mesh(g,material));}
 assert.equal(batchWorld(scene),2);const meshes=scene.children.filter(o=>o.isMesh);assert.equal(meshes.length,2);
 assert.equal(meshes.reduce((n,m)=>n+m.geometry.getAttribute('position').count,0),72);
 const centres=meshes.map(m=>m.geometry.boundingSphere.center.z).sort((a,b)=>a-b);assert.equal(centres[0],32);assert.equal(centres[1],352);
 assert.ok(meshes.every(m=>m.geometry.boundingSphere.radius<3));
});

test('contact shading remains non-shadow-casting after batching',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}),mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);mesh.castShadow=false;mesh.receiveShadow=false;scene.add(mesh);batchWorld(scene);
 assert.ok(scene.children.filter(o=>o.isMesh).every(o=>!o.castShadow&&!o.receiveShadow));
});
