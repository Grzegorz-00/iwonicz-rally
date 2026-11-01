import * as THREE from 'three';
import {scannedTreeRenderer} from './scanned-trees.js';
import {heightAt} from './terrain.js';
// Original leaf silhouettes, instanced across the whole scene rather than solid cones.
export function vegetationFactory(assets){
 const instances={broadleaf:[],pine:[]},plants=[];let scanned=null;let state=91827;
 const random=()=>((state=(state*1664525+1013904223)>>>0)/4294967296);
 function add(x,z,size=1,kind='broadleaf'){
  if(kind==='broadleaf'){plants.push({x,z,size,rotation:random()*Math.PI*2});return;}
  const y=heightAt(x,z);const count=kind==='cypress'?75:kind==='pine'?65:90;
  for(let i=0;i<count;i++){
   const angle=random()*Math.PI*2,t=random(),radius=kind==='cypress'?.50*Math.sin(Math.PI*t)**.5:kind==='pine'?(1-t)*1.9:Math.sqrt(random())*2.1;
   const height=kind==='cypress'?.3+t*4.9:kind==='pine'?1.9+t*5:2.8+random()*3;
   const type=kind==='broadleaf'?'broadleaf':'pine';
   instances[type].push({x:x+Math.cos(angle)*radius*size,y:y+height*size,z:z+Math.sin(angle)*radius*size,scale:size*(kind==='cypress'?.65:.9+random()*.5),rx:random()*Math.PI,ry:random()*Math.PI,rz:random()*Math.PI,color:new THREE.Color().setHSL(.23+random()*.07,.22+random()*.15,.10+random()*.09)});
  }
 }
 function install(scene,{castLeafShadows=true}={}){scanned=scannedTreeRenderer(scene,assets,plants,{detailed:castLeafShadows});if(castLeafShadows)assets.loadDetail().catch(e=>{assets.detailError=e.message;console.error("Detailed tree could not load",e);});for(const [type,points] of Object.entries(instances)){
  const texture=leafTexture(type==='pine');const material=new THREE.MeshStandardMaterial({map:texture,alphaTest:.45,side:THREE.DoubleSide,roughness:1,alphaToCoverage:true});
  const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,.85),material,points.length),dummy=new THREE.Object3D();
  points.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.setScalar(p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,p.color);});
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.castShadow=castLeafShadows;mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);
 }}
 return {add,install,update:(camera,player)=>scanned?.update(camera,player),get detailCount(){return scanned?.detailCount||0;},get count(){return plants.length;}};
}
function leafTexture(pine){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
 ctx.strokeStyle='#6e7050';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(128,240);ctx.lineTo(128,28);ctx.stroke();
 if(pine){for(let i=0;i<15;i++){let y=30+i*13;for(const side of [-1,1]){const reach=Math.sin(i/15*Math.PI)*90+10;ctx.strokeStyle=i%2?'#a9bca0':'#8da785';ctx.lineWidth=3;for(let k=0;k<7;k++){ctx.beginPath();ctx.moveTo(128,y+k*2);ctx.lineTo(128+side*(reach-k*5),y+22+k*2);ctx.stroke();}}}}
 else for(let row=0;row<6;row++){const y=28+row*32;for(const side of [-1,1]){ctx.save();ctx.translate(128+side*(35+row*4),y+10);ctx.rotate(side*-.6);ctx.fillStyle=row%2?'#c0cbaa':'#b3c29c';ctx.beginPath();ctx.ellipse(0,0,23,41,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e6e6bd';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-32);ctx.lineTo(0,32);ctx.stroke();ctx.restore();}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
