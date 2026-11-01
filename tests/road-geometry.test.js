import {test} from 'node:test';import assert from 'node:assert/strict';
import data from '../src/data/zdrojowa.json' with {type:'json'};
import {grid,heightAt} from '../src/terrain.js';
import {ribbonGeometry,groundGeometry} from '../src/road-geometry.js';
function drape(g){const p=g.getAttribute('position');for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+heightAt(p.getX(i),p.getZ(i)));return g;}
function triangles(g){const p=g.getAttribute('position'),idx=g.index.array,out=[];for(let i=0;i<idx.length;i+=3)out.push(Array.from(idx.slice(i,i+3),k=>[p.getX(k),p.getY(k),p.getZ(k)]));return out;}
function at(t,x,z){const [a,b,c]=t,d=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(d)<1e-10)return null;const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/d,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/d;if(u<-.00001||v<-.00001||u+v>1.00001)return null;return u*a[1]+v*b[1]+(1-u-v)*c[1];}
test('rendered grass stays below the complete road and western walk, including bends and slopes',()=>{
 const ground=triangles(drape(groundGeometry(grid,data.route))),buckets=new Map();
 for(const t of ground){const x0=Math.floor(Math.min(...t.map(p=>p[0]))/10),x1=Math.floor(Math.max(...t.map(p=>p[0]))/10),z0=Math.floor(Math.min(...t.map(p=>p[2]))/10),z1=Math.floor(Math.max(...t.map(p=>p[2]))/10);for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const k=x+','+z;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(t);}}
 let checked=0;
 for(const [width,y,offset] of [[6.2,.06,0],[1.7,.12,-4]])for(const t of triangles(drape(ribbonGeometry(data.route,width,y,offset)))){
  for(const weights of [[1/3,1/3,1/3],[.8,.1,.1],[.1,.8,.1],[.1,.1,.8]]){
   const p=[0,1,2].map(axis=>t.reduce((v,q,i)=>v+q[axis]*weights[i],0));
   const matches=(buckets.get(Math.floor(p[0]/10)+','+Math.floor(p[2]/10))||[]).map(t=>at(t,p[0],p[2])).filter(v=>v!==null);
   assert.ok(matches.length,'missing ground coverage');assert.ok(Math.max(...matches)<p[1]-.01,`grass intersects pavement at ${p[0]}, ${p[2]}`);checked++;
  }
 }
 assert.ok(checked>10000);
});
test('continuous sidewalk spans every OSM way boundary and keeps its width on a bend',()=>{
 const g=ribbonGeometry([[0,0],[0,10],[10,20]],1.7,.12,-4),p=g.getAttribute('position');
 assert.ok(p.count>40);for(let i=0;i<p.count;i+=2){const w=Math.hypot(p.getX(i)-p.getX(i+1),p.getZ(i)-p.getZ(i+1));assert.ok(w>=1.699&&w<2);}
 assert.equal(g.index.count,(p.count/2-1)*6);
});
