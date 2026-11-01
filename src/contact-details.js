import * as THREE from 'three';
export function foundationDepth(points,anchorHeight,height){return Math.max(2,anchorHeight-Math.min(...points.map(([x,z])=>height(x,z)))+.4);}
export function footingMaterial(){
 const c=document.createElement('canvas');c.width=8;c.height=128;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,128);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(0,0,0,.04)');g.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=g;ctx.fillRect(0,0,8,128);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,side:THREE.DoubleSide});
}
export function footingShade(points,scene,material){
 const area=points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-b[0]*a[1];},0),vertices=[],uv=[],indices=[];
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!len)continue;const sign=area>0?1:-1,nx=(b[1]-a[1])/len*sign,nz=-(b[0]-a[0])/len*sign,k=vertices.length/3;
  for(const [p,d] of [[a,0],[b,0],[b,.9],[a,.9]])vertices.push(p[0]+nx*d,-.287,p[1]+nz*d);uv.push(0,0,1,0,1,1,0,1);indices.push(k,k+1,k+2,k,k+2,k+3);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const mesh=new THREE.Mesh(g,material);mesh.userData.conformTerrain=true;mesh.castShadow=false;mesh.receiveShadow=false;scene.add(mesh);
}
export function carContactShadow(car){
 const c=document.createElement('canvas');c.width=128;c.height=256;const ctx=c.getContext('2d');ctx.scale(1,2);const g=ctx.createRadialGradient(64,64,10,64,64,63);g.addColorStop(0,'rgba(0,0,0,.43)');g.addColorStop(.55,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const m=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.6,3.0),m);mesh.rotation.x=-Math.PI/2;mesh.position.y=.006;car.add(mesh);
}
