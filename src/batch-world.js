import * as THREE from 'three';
import {heightAt} from './terrain.js';
// Partition by actual world-space triangle position, including meshes whose origin is (0,0,0).
export function batchWorld(scene){
 scene.updateMatrixWorld(true);const meshes=[];scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)meshes.push(o);});const batches=new Map();
 for(const o of meshes){const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();if(!g.getAttribute('uv'))g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));g.applyMatrix4(o.matrixWorld);
  const pos=g.getAttribute('position');g.computeBoundingBox();const center=g.boundingBox.getCenter(new THREE.Vector3()),anchor=o.userData.terrainAnchor,fixed=heightAt(anchor?anchor[0]:center.x,anchor?anchor[1]:center.z);
  for(let i=0;i<pos.count;i++)pos.setY(i,pos.getY(i)+(o.userData.conformTerrain?heightAt(pos.getX(i),pos.getZ(i)):fixed));g.computeVertexNormals();
  const normal=g.getAttribute('normal'),uv=g.getAttribute('uv'),tile=o.material.userData.tile;
  if(tile)for(let i=0;i<pos.count;i++){const nx=normal.getX(i),ny=normal.getY(i),nz=normal.getZ(i);uv.setXY(i,(Math.abs(ny)>.5?pos.getX(i):pos.getX(i)*nz-pos.getZ(i)*nx)/tile,(Math.abs(ny)>.5?pos.getZ(i):pos.getY(i))/tile);}
  for(let i=0;i<pos.count;i+=3){const x=(pos.getX(i)+pos.getX(i+1)+pos.getX(i+2))/3,z=(pos.getZ(i)+pos.getZ(i+1)+pos.getZ(i+2))/3,key=o.material.uuid+':'+Math.floor(x/64)+':'+Math.floor(z/64);let batch=batches.get(key);if(!batch){batch={material:o.material,p:[],n:[],uv:[]};batches.set(key,batch);}
   for(let j=i;j<i+3;j++){batch.p.push(pos.getX(j),pos.getY(j),pos.getZ(j));batch.n.push(normal.getX(j),normal.getY(j),normal.getZ(j));batch.uv.push(uv.getX(j),uv.getY(j));}
  }
  g.dispose();o.removeFromParent();
 }
 for(const b of batches.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const mesh=new THREE.Mesh(g,b.material);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);}
 return batches.size;
}
