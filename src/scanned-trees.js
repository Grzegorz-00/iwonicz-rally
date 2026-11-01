import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {heightAt} from './terrain.js';

export async function treeAssets(){
 const atlas=await new THREE.TextureLoader().loadAsync('/vegetation/tree-atlas.png');atlas.colorSpace=THREE.SRGBColorSpace;
 const asset={atlas,parts:[],detailReady:false,detailError:null};
 asset.loadDetail=async()=>{
  if(asset.detailReady)return;
  const gltf=await new GLTFLoader().loadAsync('/vegetation/tree.glb');gltf.scene.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(gltf.scene),h=box.max.y-box.min.y;
  gltf.scene.traverse(o=>{if(o.isMesh){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);g.scale(1/h,1/h,1/h);g.translate(0,-box.min.y/h,0);g.computeBoundingSphere();asset.parts.push({geometry:g,material:o.material});}});
  asset.detailReady=true;
 };
 return asset;
}
export function nearbyTreeIndices(plants,camera,player){
 const fx=player.x-camera.x,fz=player.z-camera.z,len=Math.hypot(fx,fz)||1;
 return plants.map((p,i)=>({i,d:(p.x-player.x)**2+(p.z-player.z)**2,forward:((p.x-camera.x)*fx+(p.z-camera.z)*fz)/len})).filter(p=>p.d<24**2&&p.forward>1).sort((a,b)=>a.d-b.d).slice(0,2).map(p=>p.i);
}
export function scannedTreeRenderer(scene,asset,plants,{detailed=false}={}){
 const material=new THREE.MeshBasicMaterial({map:asset.atlas,alphaTest:.35,side:THREE.DoubleSide,toneMapped:false});
 const geometry=new THREE.PlaneGeometry(1.4,1.4);geometry.translate(0,.45,0);
 const views=new THREE.InstancedBufferAttribute(new Float32Array(plants.length),1);geometry.setAttribute('treeView',views);
 material.onBeforeCompile=shader=>{
  shader.vertexShader='attribute float treeView; varying float vTreeView;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTreeView=treeView;');
  shader.fragmentShader='varying float vTreeView;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replaceAll('vMapUv','vec2((vMapUv.x+vTreeView)*.25,vMapUv.y)'));
 };
 const cards=new THREE.InstancedMesh(geometry,material,plants.length);cards.count=0;cards.castShadow=false;scene.add(cards);
 const details=[],dummy=new THREE.Object3D();let lastX=Infinity,lastZ=Infinity,lastPlayerX=Infinity,lastPlayerZ=Infinity,lastReady=false;
 function update(camera,player){
  if(lastReady===asset.detailReady&&Math.hypot(camera.x-lastX,camera.z-lastZ)<.1&&Math.hypot(player.x-lastPlayerX,player.z-lastPlayerZ)<.1)return;
  lastX=camera.x;lastZ=camera.z;lastPlayerX=player.x;lastPlayerZ=player.z;lastReady=asset.detailReady;
  if(detailed&&asset.detailReady&&!details.length)for(const part of asset.parts){const mesh=new THREE.InstancedMesh(part.geometry,part.material,2);mesh.castShadow=true;mesh.receiveShadow=true;mesh.count=0;scene.add(mesh);details.push(mesh);}
  const near=detailed&&asset.detailReady?nearbyTreeIndices(plants,camera,player):[];
  let count=0;
  for(let i=0;i<plants.length;i++){
   const p=plants[i],y=heightAt(p.x,p.z),height=6.5*p.size;
   if(near.includes(i)){dummy.position.set(p.x,y,p.z);dummy.rotation.set(0,p.rotation,0);dummy.scale.setScalar(height);dummy.updateMatrix();const slot=near.indexOf(i);for(const mesh of details)mesh.setMatrixAt(slot,dummy.matrix);continue;}
   const bearing=Math.atan2(camera.x-p.x,camera.z-p.z);const view=((Math.round((bearing-p.rotation)/(Math.PI/2))%4)+4)%4;
   dummy.position.set(p.x,y,p.z);dummy.rotation.set(0,bearing,0);dummy.scale.setScalar(height);dummy.updateMatrix();cards.setMatrixAt(count,dummy.matrix);views.setX(count,view);count++;
  }
  cards.count=count;cards.instanceMatrix.needsUpdate=true;views.needsUpdate=true;if(count)cards.computeBoundingSphere();
  for(const mesh of details){mesh.count=near.length;mesh.instanceMatrix.needsUpdate=true;if(near.length)mesh.computeBoundingSphere();}
 }
 return {update,get detailCount(){return details.length?details[0].count:0;},get count(){return plants.length;}};
}
