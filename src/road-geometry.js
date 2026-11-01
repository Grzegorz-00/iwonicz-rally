import * as THREE from 'three';
import {nearestOnLine} from './geography.js';
export function ribbonGeometry(input,width,y=0,offset=0,skirt=0){
 const points=[];for(let i=0;i<input.length-1;i++){const a=input[i],b=input[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));for(let k=0;k<n;k++)points.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}points.push(input.at(-1));
 const vertices=[],indices=[];
 for(let i=0;i<points.length;i++){
  const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
  const normal=(a,b)=>{const l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [-(b[1]-a[1])/l,(b[0]-a[0])/l];};
  const na=normal(i?a:p,i?p:b),nb=normal(i<points.length-1?p:a,i<points.length-1?b:p);
  let nx=na[0]+nb[0],nz=na[1]+nb[1],l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;
  const miter=1/Math.max(.5,nx*nb[0]+nz*nb[1]);
  for(const edge of [-1,1]){const d=(offset+edge*width/2)*miter;vertices.push(p[0]+nx*d,y,p[1]+nz*d);}
  if(i<points.length-1){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
 }
 if(skirt>0)for(let i=0;i<points.length-1;i++)for(const side of [0,1]){const a=(i*2+side)*3,b=((i+1)*2+side)*3,k=vertices.length/3;vertices.push(vertices[a],vertices[a+1],vertices[a+2],vertices[b],vertices[b+1],vertices[b+2],vertices[b],vertices[b+1]-skirt,vertices[b+2],vertices[a],vertices[a+1]-skirt,vertices[a+2]);if(side===0)indices.push(k,k+1,k+2,k,k+2,k+3);else indices.push(k,k+2,k+1,k,k+3,k+2);}
 return geometry(vertices,indices);
}
function geometry(vertices,indices){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;}
export function groundGeometry(grid,route){
 const cols=grid.nx-1,rows=grid.nz-1,flags=[];
 for(let z=0;z<rows;z++)for(let x=0;x<cols;x++)flags.push(nearestOnLine(route,grid.x0+(x+.5)*grid.step,grid.z0+(z+.5)*grid.step).distance<22);
 const fine=(x,z)=>x>=0&&z>=0&&x<cols&&z<rows&&flags[z*cols+x];
 const vertices=[],indices=[];
 function triangle(a,b,c){const k=vertices.length/3;for(const p of [a,b,c])vertices.push(p[0],-.3,p[1]);indices.push(k,k+2,k+1);}
 for(let z=0;z<rows;z++)for(let x=0;x<cols;x++){
  const x0=grid.x0+x*grid.step,z0=grid.z0+z*grid.step;
  if(fine(x,z)){const step=grid.step/5;for(let j=0;j<5;j++)for(let i=0;i<5;i++){const a=[x0+i*step,z0+j*step],b=[a[0]+step,a[1]],c=[a[0]+step,a[1]+step],d=[a[0],a[1]+step];triangle(a,b,c);triangle(a,c,d);}}
  else{
   // Subdivide shared edges when a neighbour is fine, avoiding terrain T-junctions.
   const corners=[[x0,z0],[x0+grid.step,z0],[x0+grid.step,z0+grid.step],[x0,z0+grid.step]],neighbours=[fine(x,z-1),fine(x+1,z),fine(x,z+1),fine(x-1,z)],edge=[];
   for(let side=0;side<4;side++){const a=corners[side],b=corners[(side+1)%4],n=neighbours[side]?5:1;for(let k=0;k<n;k++)edge.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}
   const center=[x0+grid.step/2,z0+grid.step/2];for(let i=0;i<edge.length;i++)triangle(center,edge[i],edge[(i+1)%edge.length]);
  }
 }
 return geometry(vertices,indices);
}
