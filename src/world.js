import * as THREE from 'three';
import {ribbonGeometry,groundGeometry} from './road-geometry.js';
import {heightAt,grid} from './terrain.js';
import {vegetationFactory} from './foliage.js';
import {architectureKit} from './architecture.js';
import data from './data/zdrojowa.json';
import { insidePolygon, nearestOnLine, pointAt } from './geography.js';
export { data };

export function createWorld(scene, { mat, M, box, cylinder, label,materials }) {
  let seed = 126;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const sill=materials.plaster.clone();sill.color.set(0x9da39e);const fence=mat(0x626552);
  const vegetation=vegetationFactory();
  const architecture=architectureKit({scene,mat,M,box,cylinder,materials,route:data.route,vegetation});
  const water = mat(0x668d86, {roughness:.3});
  const pathMat = mat(0xb1a68f), meadow = mat(0xa5b18a), forest = mat(0x8b9b77);
  const rails = mat(0x9d9d80);
  const features = [], drivable = [];
  const terrainMesh=new THREE.Mesh(groundGeometry(grid,data.route),M.grass);terrainMesh.userData.conformTerrain=true;terrainMesh.receiveShadow=true;scene.add(terrainMesh);
  function strip(points,width,material,y=.025,offset=0){if(points.length<2)return;const mesh=new THREE.Mesh(ribbonGeometry(points,width,y,offset,[M.road,M.walk,M.curb,pathMat].includes(material)?.5:0),material);mesh.userData.conformTerrain=true;mesh.receiveShadow=true;scene.add(mesh);}
  // OSM centre lines and tagged bridges, in their real positions.
  for(const f of data.waterways)strip(f.points,f.tags.name==='Iwoniczanka'?3.2:1.2,water,-.02);
  for(const f of data.roads) {
    const pedestrian=['footway','path','pedestrian','cycleway','track'].includes(f.tags.highway);
    const width=Number.parseFloat(f.tags.width)||(pedestrian?1.6:f.tags.highway==='service'?3.2:5.5);
    strip(f.points,width,pedestrian?pathMat:M.road,pedestrian?.018:.035);
    if(!pedestrian)drivable.push({points:f.points,width});
  }
  const mainWidth=6.2; // Estimated from imagery, not an OSM measurement.
  strip(data.route,mainWidth,M.road,.06);
  // A continuous western walk is a deliberate gameplay reconstruction, not a new survey.
  strip(data.route,1.7,M.walk,.12,-4.0);strip(data.route,.16,M.curb,.16,-3.15);
  for(const f of data.routeWays) {
    drivable.push({points:f.points,width:mainWidth});
    const side=f.tags.sidewalk;
    const sides=side==='both'?[-1,1]:side==='right'?[f.reversed?-1:1]:side==='left'?[f.reversed?1:-1]:[];
    for(const side of sides.filter(side=>side===1)){strip(f.points,1.35,M.walk,.11,side*(mainWidth/2+.8));strip(f.points,.16,M.curb,.14,side*(mainWidth/2+.1));}
    if(f.tags.bridge==='yes') {
      for(const side of [-1,1]) {
        strip(f.points,.22,M.curb,.2,side*4.1);
        for(const y of [.55,1.05])strip(f.points,.075,rails,y,side*4.1);
        const len=f.points.reduce((s,p,i)=>i?s+Math.hypot(p[0]-f.points[i-1][0],p[1]-f.points[i-1][1]):0,0);
        for(let s=0;s<=len;s+=1.8){const p=pointAt(f.points,s);const x=p.x-Math.cos(p.heading)*side*4.1,z=p.z+Math.sin(p.heading)*side*4.1;cylinder(.035,.035,1.05,rails,x,.6,z);}
      }
    }
  }
  // Street furniture and western paved walk confirmed in the three new Mapillary views.
  const zone=[];for(let s=650;s<=830;s+=3){const p=pointAt(data.route,s);zone.push([p.x,p.z]);}
  strip(zone,.18,mat(0x986b5c),.13,-3.55);
  strip(zone,.15,mat(0xc2bda6),.07,-2.98);
  const guard=[];for(let s=680;s<=815;s+=3){const p=pointAt(data.route,s);guard.push([p.x,p.z]);}
  strip(guard,.15,M.chrome,.67,3.55);
  for(let s=680;s<815;s+=3){const p=pointAt(data.route,s);box(.06,.75,.08,M.chrome,p.x-Math.cos(p.heading)*3.55,.35,p.z+Math.sin(p.heading)*3.55);}
  for(let s=650;s<=830;s+=38){const p=pointAt(data.route,s),x=p.x+Math.cos(p.heading)*5.3,z=p.z-Math.sin(p.heading)*5.3;cylinder(.075,.11,6,mat(0x92968f),x,3,z);const q=pointAt(data.route,Math.min(s+38,830));const xx=q.x+Math.cos(q.heading)*5.3,zz=q.z-Math.sin(q.heading)*5.3;const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new THREE.Vector3(x+(xx-x)*t,5.8-Math.sin(t*Math.PI)*.45,z+(zz-z)*t));}if(s<802){const curve=new THREE.CatmullRomCurve3(pts);const wire=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.012,4,false),M.black);wire.userData.conformTerrain=true;scene.add(wire);}}
  // Each house retains its OSM footprint; photographed frontages have explicit profiles.
  for(const f of data.buildings){const house=architecture.house(f);if(house)features.push(house);}
  // Low garden fences, inspired by the photographed frontages. Layout is approximate.
  for(const b of features){
    const cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2,p=nearestOnLine(data.route,cx,cz);
    if(b.id==='347637101'||p.distance<9||p.distance>35)continue;
    const nx=Math.cos(p.heading),nz=-Math.sin(p.heading),side=Math.sign((cx-p.x)*nx+(cz-p.z)*nz);
    const radius=(b.maxX-b.minX)/2*Math.abs(nx)+(b.maxZ-b.minZ)/2*Math.abs(nz);
    const offset=Math.max(5,p.distance-radius-1.5),fx=p.x+nx*side*offset,fz=p.z+nz*side*offset;
    const len=Math.min(15,Math.max(5,(b.maxX-b.minX)*Math.abs(nz)+(b.maxZ-b.minZ)*Math.abs(nx)));
    for(let along=-len/2;along<len/2;along+=2){
      if(Math.abs(along)<1.7)continue;
      const x=fx+Math.sin(p.heading)*along,z=fz+Math.cos(p.heading)*along;
      if(drivable.some(r=>nearestOnLine(r.points,x,z).distance<r.width/2+1))continue;
      for(const y of [.25,1.05]){const rail=box(.045,.045,1.9,fence,x,y,z);rail.rotation.y=p.heading;}
      box(.075,1.13,.075,sill,x,.56,z);
      for(let k=-.8;k<1;k+=.32){const picket=box(.025,.78,.025,fence,x+Math.sin(p.heading)*k,.65,z+Math.cos(p.heading)*k);}
    }
  }
  function tree(x,z,size=1,pine=false){cylinder(.08*size,.18*size,4.5*size,M.trunk,x,2.25*size,z);vegetation.add(x,z,size,pine?'pine':'broadleaf');}
  // Vegetation distribution follows mapped woodland; individual trees are illustrative.
  let treeCount=0;
  for(const f of data.landcover.filter(f=>f.tags.landuse==='forest'||f.tags.natural==='wood')) {
    const xs=f.points.map(p=>p[0]),zs=f.points.map(p=>p[1]);
    const x0=Math.max(-500,Math.min(...xs)),x1=Math.min(500,Math.max(...xs));
    const z0=Math.max(-100,Math.min(...zs)),z1=Math.min(1500,Math.max(...zs));
    for(let z=z0;z<z1;z+=15)for(let x=x0;x<x1;x+=15) {
      if(treeCount>650)break;
      const px=x+random()*10,pz=z+random()*10;
      if(insidePolygon(f.points,px,pz)&&nearestOnLine(data.route,px,pz).distance>8&&!features.some(b=>px>b.minX-2&&px<b.maxX+2&&pz>b.minZ-2&&pz<b.maxZ+2)){tree(px,pz,.8+random()*.5);treeCount++;}
    }
  }
  // Scattered garden trees: inferred greenery, not surveyed individual tree locations.
  for(let s=15;s<data.length;s+=18){const p=pointAt(data.route,s);for(const side of [-1,1]){const d=11+random()*13,x=p.x-Math.cos(p.heading)*side*d,z=p.z+Math.sin(p.heading)*side*d;if(!features.some(b=>x>b.minX-3&&x<b.maxX+3&&z>b.minZ-3&&z<b.maxZ+3)&&drivable.every(r=>nearestOnLine(r.points,x,z).distance>r.width/2+2))tree(x,z,.65+random()*.5,random()>.7);}}
  // Garden planting is illustrative; never place it in a mapped road or building.
  for(const b of features){
    if(random()>.55||nearestOnLine(data.route,(b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2).distance>100)continue;
    const x=random()>.5?b.maxX+3.5:b.minX-3.5,z=b.minZ+random()*(b.maxZ-b.minZ);
    if(!features.some(o=>x>o.minX-2&&x<o.maxX+2&&z>o.minZ-2&&z<o.maxZ+2)&&drivable.every(r=>nearestOnLine(r.points,x,z).distance>r.width/2+2))tree(x,z,.8+random()*.4,random()>.75);
  }
  // Vegetable beds visible north of number 87 in ortho; crop and cover details are illustrative.
  for(let i=0;i<5;i++){box(2.1,.12,1.1,mat(0x6e5942),30,.03,744+i*2.2);for(let k=0;k<3;k++)box(1.9,.08,.08,M.darkleaf,30,.14,743.6+i*2.2+k*.3);}
  // The street signs mark real junctions; pole placement is illustrative.
  function streetSign(s,text) {const p=pointAt(data.route,s);const group=new THREE.Group();group.position.set(p.x-4.4*Math.cos(p.heading),0,p.z+4.4*Math.sin(p.heading));group.rotation.y=p.heading+Math.PI;scene.add(group);cylinder(.04,.04,2.7,M.chrome,0,1.35,0,group);box(2.2,.55,.06,new THREE.MeshStandardMaterial({map:label(text)}),0,2.45,0,group);}
  streetSign(15,'ul. Zdrojowa');streetSign(data.length-15,'ul. Długa');
  const signed=new Set(['Zdrojowa','Długa','Aleja Słoneczna','Feliksa Piwarskiego']);
  for(const road of data.roads){if(!road.tags.name||signed.has(road.tags.name))continue;const near=road.points.map(([x,z])=>nearestOnLine(data.route,x,z)).sort((a,b)=>a.distance-b.distance)[0];if(near.distance<5&&near.s>50&&near.s<data.length-40){streetSign(near.s,road.tags.name);signed.add(road.tags.name);}}
  return {
    routeAt:s=>pointAt(data.route,s),
    nearest:(x,z)=>nearestOnLine(data.route,x,z),
    onRoad:(x,z)=>drivable.some(r=>nearestOnLine(r.points,x,z).distance<r.width/2),
    collides:(x,z)=>features.some(b=>x>=b.minX-1&&x<=b.maxX+1&&z>=b.minZ-1&&z<=b.maxZ+1&&(insidePolygon(b.points,x,z)||nearestOnLine(b.points,x,z).distance<1)),
    installVegetation:options=>vegetation.install(scene,options),
    buildings:features,referenceBuildings:features.filter(f=>f.reference).map(f=>f.id),
  };
}
