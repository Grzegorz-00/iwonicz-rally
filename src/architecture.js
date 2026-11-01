import * as THREE from 'three';
import refs from './data/facade-references.json';
import {nearestOnLine} from './geography.js';
export {refs};

export function architectureKit({scene,mat,M,box,cylinder,materials,route,vegetation}){
 const plasterCache=new Map(),roofCache=new Map();
 const trim=mat(0xe2e1d8,{roughness:.7}),plinth=materials.plaster.clone();plinth.color.set(0x747977);plinth.userData.tile=1.5;
 const drain=mat(0x697574,{metalness:.55,roughness:.48}),black=mat(0x222a2b),glassCache=[];
 const metalMap=metalTexture(),woodMap=sidingTexture();
 for(let i=0;i<5;i++)glassCache.push(windowMaterial(i));
 function material(color,siding=false){const key=color+siding;if(!plasterCache.has(key)){const m=materials.plaster.clone();m.map=null;m.color.set(color);if(siding){m.map=woodMap;m.normalMap=null;m.bumpMap=woodMap;m.bumpScale=.014;m.userData.tile=2;}plasterCache.set(key,m);}return plasterCache.get(key);}
 function roofMaterial(color,metal=false){const key=color+metal;if(!roofCache.has(key)){const m=materials.slate.clone();m.color.set(color);if(metal){m.map=metalMap;m.normalMap=null;m.bumpMap=metalMap;m.bumpScale=.008;m.metalness=.38;m.roughness=.62;m.userData.tile=2;}roofCache.set(key,m);}return roofCache.get(key);}
 function beam(a,b,r,m=drain){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,av.distanceTo(bv),8),m);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());o.castShadow=true;scene.add(o);return o;}
 function flatMesh(points,indices,m){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setIndex(indices);g.computeVertexNormals();const o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
 function makeRoof(pts,h,rise,style,color,metal,ridgeShort=false,wallMat=trim){
  let edge=0,len=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l>len){len=l;edge=i;}}
  const a=pts[edge],b=pts[(edge+1)%pts.length];let ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len;if(ridgeShort)[ux,uz]=[-uz,ux];const vx=-uz,vz=ux;
  const us=pts.map(p=>p[0]*ux+p[1]*uz),vs=pts.map(p=>p[0]*vx+p[1]*vz),u0=Math.min(...us)-.25,u1=Math.max(...us)+.25,v0=Math.min(...vs)-.35,v1=Math.max(...vs)+.35;
  const p=(u,v,y)=>[u*ux+v*vx,y,u*uz+v*vz],mid=(v0+v1)/2;
  const corners=[p(u0,v0,h),p(u1,v0,h),p(u1,v1,h),p(u0,v1,h)];
  const roofMat=roofMaterial(color,metal);roofMat.side=THREE.DoubleSide;
  if(style==='flat'){flatMesh(corners,[0,2,1,0,3,2],roofMat);return;}
  const inset=style==='hipped'?Math.min((u1-u0)*.3,(v1-v0)*.45):0;
  const r0=p(u0+inset,mid,h+rise),r1=p(u1-inset,mid,h+rise);
  flatMesh([corners[0],corners[1],r1,r0],[0,2,1,0,3,2],roofMat);
  flatMesh([corners[3],r0,r1,corners[2]],[0,2,1,0,3,2],roofMat);
  flatMesh([corners[0],r0,corners[3]],[0,2,1],style==='hipped'?roofMat:wallMat);
  flatMesh([corners[1],corners[2],r1],[0,2,1],style==='hipped'?roofMat:wallMat);
  beam(r0,r1,.045,roofMat);
  for(const v of [v0,v1]){beam(p(u0,v,h-.06),p(u1,v,h-.06),.045);beam(p(u0+.1,v,h-.1),p(u0+.1,v,.15),.035);}
 }
 function window(wx,wz,y,dx,dz,nx,nz,w,h,variant,transom){
  const angle=Math.atan2(-dz,dx);
  const add=(ww,hh,depth,m,u,v,n)=>{const o=box(ww,hh,depth,m,wx+dx*u+nx*n,y+v,wz+dz*u+nz*n);o.rotation.y=angle;return o;};
  add(w+.18,h+.18,.06,black,0,0,.035);
  add(w,h,.035,glassCache[variant%glassCache.length],0,0,.075);
  for(const [ww,hh,u,v] of [[w+.16,.07,0,h/2+.045],[w+.16,.07,0,-h/2-.045],[.07,h,-w/2-.045,0],[.07,h,w/2+.045,0],[.045,h,0,0]])add(ww,hh,.14,trim,u,v,.10);
  if(transom)add(w,.045,.14,trim,0,h*.25,.11);
  add(w+.25,.10,.34,trim,0,-h/2-.12,.11);
 }
 function house(f){
  const pts=f.points.slice(0,-1),ref=refs[f.id];if(pts.length<3)return null;
  const start=scene.children.length,xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs),cx=(minX+maxX)/2,cz=(minZ+maxZ)/2;
  const near=nearestOnLine(route,cx,cz),small=['garage','garages','shed','outbuilding','roof'].includes(f.tags.building);
  const levels=ref?.floors||Number.parseFloat(f.tags['building:levels'])||(small?1:2),h=ref?.eaves||Number.parseFloat(f.tags.height)||(levels*2.75+.2);
  const palette=['#d0cfbf','#c9cbc5','#d9d2b8','#c9d0ce','#c6bba6'];const wall=material(ref?.wallColor||palette[Number(f.id)%palette.length],ref?.siding);
  const shape=new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z)));const g=new THREE.ExtrudeGeometry(shape,{depth:h+2,bevelEnabled:false});g.rotateX(-Math.PI/2);g.translate(0,-2,0);const body=new THREE.Mesh(g,wall);body.castShadow=true;body.receiveShadow=true;scene.add(body);
  const roofStyle=ref?.roof||f.tags['roof:shape']||(small?'flat':'gabled'),rise=ref?.roofHeight||Number.parseFloat(f.tags['roof:height'])||Math.min(3.1,Math.min(maxX-minX,maxZ-minZ)*.36);
  const roofColors=['#8d9693','#867b6b','#a5aba7','#74594a'];makeRoof(pts,h,rise,roofStyle,ref?.roofColor||roofColors[Number(f.id)%roofColors.length],ref?.roofMaterial==='metal',ref?.ridge==='short',wall);
  const area=pts.reduce((sum,a,i)=>{const b=pts[(i+1)%pts.length];return sum+a[0]*b[1]-b[0]*a[1];},0);
  const edges=pts.map((a,i)=>{const b=pts[(i+1)%pts.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len,sign=area>0?1:-1;return {a,b,len,dx,dz,nx:dz*sign,nz:-dx*sign,near:nearestOnLine(route,(a[0]+b[0])/2,(a[1]+b[1])/2).distance};});
  const front=edges.filter(e=>e.len>4).sort((a,b)=>a.near-b.near)[0];
  for(const e of edges){const {a,b,len,dx,dz,nx,nz}=e;if(len<1)continue;
   const angle=Math.atan2(-dz,dx),base=box(len,.55,.06,plinth,(a[0]+b[0])/2,.275,(a[1]+b[1])/2);base.rotation.y=angle;
   if(near.distance>95||small||len<3)continue;
   const n=e===front&&ref?.frontBays?ref.frontBays:Math.max(1,Math.floor((len-1.6)/3.2));
   for(let floor=0;floor<Math.min(levels,5);floor++)for(let i=0;i<n;i++){
    const t=(i+1)/(n+1);if(e===front&&floor===0&&Math.abs(t-.5)*len<1.05)continue;window(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,1.7+floor*2.75,dx,dz,nx,nz,ref?.windowWidth||1.15,ref?.windowHeight||1.45,Number(f.id)+i+floor,ref?.transom||false);
   }
   // Cornice shadows and subtle storey band seen on the older plastered buildings.
   const cornice=box(len+.12,.13,.16,trim,(a[0]+b[0])/2,h-.13,(a[1]+b[1])/2);cornice.rotation.y=angle;
  }
  if(front&&near.distance<80&&!small){const {a,b,dx,dz,nx,nz,len}=front,angle=Math.atan2(-dz,dx),wx=a[0]+(b[0]-a[0])*.5,wz=a[1]+(b[1]-a[1])*.5;
   const door=box(.98,2.10,.09,black,wx+nx*.07,1.08,wz+nz*.07);door.rotation.y=angle;
   const step=box(1.25,.16,.65,trim,wx+nx*.38,.08,wz+nz*.38);step.rotation.y=angle;
   if(ref?.dormer){
    const base=h+.15,half=1.2,depth=1.6,local=(u,v,y)=>[wx+dx*u+nx*v,y,wz+dz*u+nz*v];
    const a=local(-half,.15,base),b=local(half,.15,base),c=local(half,.15,base+1.0),d=local(-half,.15,base+1.0),peak=local(0,.15,base+2.3),back=local(0,-depth,base+2.3);
    flatMesh([a,b,c,d],[0,2,1,0,3,2],wall);flatMesh([d,c,peak],[0,2,1],wall);
    const rm=roofMaterial(ref.roofColor,true);rm.side=THREE.DoubleSide;
    flatMesh([d,peak,back,local(-half,-depth,base+1)],[0,2,1,0,3,2],rm);flatMesh([c,local(half,-depth,base+1),back,peak],[0,2,1,0,3,2],rm);
    window(wx+nx*.17,wz+nz*.17,base+.52,dx,dz,nx,nz,.75,.85,2,false);
   }
   if(ref?.balcony){const length=Math.min(8,len-.3),y=2.9,depth=1.15;
    const slab=box(length,.17,depth,trim,wx+nx*depth/2,y,wz+nz*depth/2);slab.rotation.y=angle;
    for(const ht of [.2,1.0])beam([wx-dx*length/2+nx*depth,y+ht,wz-dz*length/2+nz*depth],[wx+dx*length/2+nx*depth,y+ht,wz+dz*length/2+nz*depth],.025,trim);
    for(let u=-length/2;u<=length/2;u+=.32)beam([wx+dx*u+nx*depth,y+.2,wz+dz*u+nz*depth],[wx+dx*u+nx*depth,y+1,wz+dz*u+nz*depth],.013,trim);
    for(const side of [-1,1])beam([wx+dx*side*length/2+nx*depth,.1,wz+dz*side*length/2+nz*depth],[wx+dx*side*length/2+nx*depth,y,wz+dz*side*length/2+nz*depth],.045,trim);
   }
   if(ref?.hedge){for(let u=-len/2+.7;u<len/2;u+=1.05)vegetation.add(wx+dx*u+nx*2.2,wz+dz*u+nz*2.2,1,'cypress');}
  }
  if(near.distance<85&&!small)box(.55,1.0,.6,plinth,cx+1,h+rise*.6,cz); // Inferred chimney, not a surveyed location.
  for(const o of scene.children.slice(start))o.userData.terrainAnchor=[cx,cz];
  return {...f,minX,maxX,minZ,maxZ,height:h,reference:ref?.reference||null};
 }
 return {house,referenceCount:Object.keys(refs).length};
}
function windowMaterial(seed){
 const c=document.createElement('canvas');c.width=128;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle=['#252b2a','#41423a','#34403e','#45453f','#2c3637'][seed];ctx.fillRect(0,0,128,192);
 const grad=ctx.createLinearGradient(0,0,128,0);grad.addColorStop(0,'#c9cbc2');grad.addColorStop(.22,'#e3e3d5');grad.addColorStop(.38,'#878f8a');grad.addColorStop(.5,'#3e4845');grad.addColorStop(.62,'#939e99');grad.addColorStop(.84,'#d7ded3');grad.addColorStop(1,'#c3cabe');ctx.fillStyle=grad;ctx.fillRect(4,12,120,178);ctx.fillStyle='#38423f99';ctx.fillRect(36+seed*3,12,46,155);ctx.strokeStyle='#ffffff22';for(let x=6;x<126;x+=5){ctx.beginPath();ctx.moveTo(x,14);ctx.lineTo(x+2,184);ctx.stroke();}
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshPhysicalMaterial({map,color:0xb2c4c5,metalness:.25,roughness:.16,clearcoat:1});
}
function metalTexture(){return patternTexture((ctx)=>{ctx.fillStyle='#b3b9b8';ctx.fillRect(0,0,256,256);for(let x=0;x<256;x+=32){ctx.fillStyle='#59686a';ctx.fillRect(x,0,2,256);ctx.fillStyle='#dce0da';ctx.fillRect(x+2,0,2,256);}ctx.strokeStyle='#89938e';for(let y=0;y<256;y+=128){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}});}
function sidingTexture(){return patternTexture(ctx=>{ctx.fillStyle='#c4c7c5';ctx.fillRect(0,0,256,256);for(let y=0;y<256;y+=18){ctx.fillStyle='#535f61';ctx.fillRect(0,y,256,2);ctx.fillStyle='#edf0e9';ctx.fillRect(0,y+2,256,1);}});}
function patternTexture(draw){const c=document.createElement('canvas');c.width=c.height=256;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
