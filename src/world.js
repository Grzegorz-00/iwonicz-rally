import * as THREE from 'three';
import {heightAt,grid} from './terrain.js';
import {surface} from './surfaces.js';
import data from './data/zdrojowa.json';
import { insidePolygon, nearestOnLine, pointAt } from './geography.js';
export { data };

export function createWorld(scene, { mat, M, box, cylinder, label }) {
  let seed = 126;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const wallPalette = [0xd5cfb9,0xcbc6b8,0xe5d8b8,0xc6cecc,0xe6ddc9];
  const walls = wallPalette.map(c => mat(c));
  const roofs = [0x767b77,0x8e5945,0x575e5c].map(c => mat(c));
  const plaster=surface('plaster'),tiles=surface('roof');for(const m of walls){m.map=plaster;m.userData.tile=2;}for(const m of roofs){m.map=tiles;m.userData.tile=2;}
  const frame=mat(0xe0ddd0),sill=mat(0xb4b0a3),fence=mat(0x626552);
  const water = mat(0x668d86, {roughness:.3});
  const pathMat = mat(0xb1a68f), meadow = mat(0xa5b18a), forest = mat(0x8b9b77);
  const rails = mat(0x9d9d80), windows = M.glass;
  const features = [], drivable = [];
  const terrainGeometry=new THREE.PlaneGeometry((grid.nx-1)*grid.step,(grid.nz-1)*grid.step,grid.nx-1,grid.nz-1);terrainGeometry.rotateX(-Math.PI/2);terrainGeometry.translate(grid.x0+(grid.nx-1)*grid.step/2,-.15,grid.z0+(grid.nz-1)*grid.step/2);const terrainMesh=new THREE.Mesh(terrainGeometry,M.grass);terrainMesh.userData.conformTerrain=true;terrainMesh.receiveShadow=true;scene.add(terrainMesh);
  function strip(points, width, material, y=.025, offset=0) {
    if(points.length<2)return;
    const dense=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let k=0;k<n;k++)dense.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}dense.push(points.at(-1));points=dense;
    const vertices=[],indices=[];
    for(let i=0;i<points.length;i++) {
      const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
      const len=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
      const nx=-(b[1]-a[1])/len,nz=(b[0]-a[0])/len;
      for(const edge of [-1,1]){const d=offset+edge*width/2;vertices.push(points[i][0]+nx*d,y,points[i][1]+nz*d);}
      if(i<points.length-1){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
    const mesh=new THREE.Mesh(g,material);mesh.userData.conformTerrain=true;mesh.receiveShadow=true;scene.add(mesh);
  }
  function polygon(points, material, y) {
    if(points.length<4)return;
    const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
    const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.receiveShadow=true;scene.add(mesh);
  }
  for(const f of data.landcover) {
    if(f.points.length<4)continue;
    const wooded=f.tags.landuse==='forest'||f.tags.natural==='wood';
    // Terrain itself supplies continuous ground; landcover polygons drive vegetation and minimap.
  }
  // OSM centre lines and tagged bridges, in their real positions.
  for(const f of data.waterways)strip(f.points,f.tags.name==='Iwoniczanka'?3.2:1.2,water,-.02);
  for(const f of data.roads) {
    const pedestrian=['footway','path','pedestrian','cycleway','track'].includes(f.tags.highway);
    const width=Number.parseFloat(f.tags.width)||(pedestrian?1.6:f.tags.highway==='service'?3.2:5.5);
    strip(f.points,width,pedestrian?pathMat:M.road,pedestrian?.018:.035);
    if(!pedestrian)drivable.push({points:f.points,width});
  }
  const mainWidth=6.2; // Estimated from imagery, not an OSM measurement.
  for(const f of data.routeWays) {
    strip(f.points,mainWidth,M.road,.06);drivable.push({points:f.points,width:mainWidth});
    const side=f.tags.sidewalk;
    const sides=side==='both'?[-1,1]:side==='right'?[f.reversed?-1:1]:side==='left'?[f.reversed?1:-1]:[];
    for(const side of sides){strip(f.points,1.35,M.walk,.11,side*(mainWidth/2+.8));strip(f.points,.16,M.curb,.14,side*(mainWidth/2+.1));}
    if(f.tags.bridge==='yes') {
      for(const side of [-1,1]) {
        strip(f.points,.22,M.curb,.2,side*4.1);
        for(const y of [.55,1.05])strip(f.points,.075,rails,y,side*4.1);
        const len=f.points.reduce((s,p,i)=>i?s+Math.hypot(p[0]-f.points[i-1][0],p[1]-f.points[i-1][1]):0,0);
        for(let s=0;s<=len;s+=1.8){const p=pointAt(f.points,s);const x=p.x-Math.cos(p.heading)*side*4.1,z=p.z+Math.sin(p.heading)*side*4.1;cylinder(.035,.035,1.05,rails,x,.6,z);}
      }
    }
  }
  // Western sidewalk visible in Mapillary image 1265305397614531, local vicinity only.
  const observedSidewalk=[];for(let s=178;s<=225;s+=2) {const p=pointAt(data.route,s);observedSidewalk.push([p.x,p.z]);}
  strip(observedSidewalk,1.25,M.walk,.115,-3.85);strip(observedSidewalk,.15,M.curb,.15,-3.18);
  // Street furniture and western paved walk confirmed in the three new Mapillary views.
  const zone=[];for(let s=650;s<=830;s+=3){const p=pointAt(data.route,s);zone.push([p.x,p.z]);}
  strip(zone,1.7,M.walk,.12,-4.05);strip(zone,.18,mat(0x986b5c),.13,-3.55);strip(zone,.14,M.curb,.16,-3.15);
  strip(zone,.15,mat(0xc2bda6),.07,-2.98);
  const guard=[];for(let s=680;s<=815;s+=3){const p=pointAt(data.route,s);guard.push([p.x,p.z]);}
  strip(guard,.15,M.chrome,.67,3.55);
  for(let s=680;s<815;s+=3){const p=pointAt(data.route,s);box(.06,.75,.08,M.chrome,p.x-Math.cos(p.heading)*3.55,.35,p.z+Math.sin(p.heading)*3.55);}
  for(let s=650;s<=830;s+=38){const p=pointAt(data.route,s),x=p.x+Math.cos(p.heading)*5.3,z=p.z-Math.sin(p.heading)*5.3;cylinder(.075,.11,6,mat(0x92968f),x,3,z);const q=pointAt(data.route,Math.min(s+38,830));const xx=q.x+Math.cos(q.heading)*5.3,zz=q.z-Math.sin(q.heading)*5.3;const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new THREE.Vector3(x+(xx-x)*t,5.8-Math.sin(t*Math.PI)*.45,z+(zz-z)*t));}if(s<802){const curve=new THREE.CatmullRomCurve3(pts);const wire=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.012,4,false),M.black);wire.userData.conformTerrain=true;scene.add(wire);}}
  // True OSM outlines. Missing levels, roof forms and façade details remain estimates.
  for(const f of data.buildings) {
    const buildingStart=scene.children.length;
    const pts=f.points.slice(0,-1);if(pts.length<3)continue;
    const minX=Math.min(...pts.map(p=>p[0])),maxX=Math.max(...pts.map(p=>p[0])),minZ=Math.min(...pts.map(p=>p[1])),maxZ=Math.max(...pts.map(p=>p[1]));
    const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,near=nearestOnLine(data.route,cx,cz);
    const small=f.tags.building==='garage'||f.tags.building==='shed';
    const levels=Number.parseFloat(f.tags['building:levels'])||(small?1:2);
    const is87=f.id==='347637101';
    const h=is87?5.8:Number.parseFloat(f.tags.height)||(levels*2.8+.3);
    const shape=new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z)));
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:h+2,bevelEnabled:false});geometry.rotateX(-Math.PI/2);geometry.translate(0,-2,0);
    const mesh=new THREE.Mesh(geometry,(is87?walls[4]:walls[Number(f.id)%walls.length]));mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
    if(small||f.tags['roof:shape']==='flat')polygon(f.points,roofs[Number(f.id)%roofs.length],h+.02);
    // Roof ridge constrained to the actual footprint (no invented rectangular footprint).
    const roofHeight=Number.parseFloat(f.tags['roof:height'])||Math.min(2.8,Math.min(maxX-minX,maxZ-minZ)*.23);
    if(!is87&&f.tags['roof:shape']!=='flat'&&!small) {
      const v=[],idx=[];
      if(pts.length===4){
        const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
        const q=dist(pts[0],pts[1])<dist(pts[1],pts[2])?pts:[pts[1],pts[2],pts[3],pts[0]];
        const r1=[(q[0][0]+q[1][0])/2,h+roofHeight,(q[0][1]+q[1][1])/2],r2=[(q[2][0]+q[3][0])/2,h+roofHeight,(q[2][1]+q[3][1])/2];
        v.push(...q.flatMap(([x,z])=>[x,h,z]),...r1,...r2);idx.push(0,3,5,0,5,4,1,4,5,1,5,2,0,4,1,2,5,3);
      }else{for(const [x,z] of pts)v.push(x,h,z);const triangulated=THREE.ShapeUtils.triangulateShape(pts.map(([x,z])=>new THREE.Vector2(x,z)),[]);idx.push(...triangulated.flat());}
      const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(v,3));rg.setIndex(idx);rg.computeVertexNormals();const roof=new THREE.Mesh(rg,roofs[Number(f.id)%roofs.length]);roof.material.side=THREE.DoubleSide;roof.castShadow=true;scene.add(roof);
      if(near.distance<80){box(.65,1.2,.65,sill,cx+1,h+(pts.length===4?roofHeight*.65:.6),cz);}

    }
    if(is87){
      // Silver, north-south gabled roof and recessed property layout seen in GUGiK ortho.
      const x0=minX-.35,x1=maxX+.35,z0=minZ-.35,z1=maxZ+.35,ridge=(x0+x1)/2;
      const v=[x0,h,z0,x0,h,z1,ridge,h+2.7,z1,ridge,h+2.7,z0,x1,h,z0,x1,h,z1];
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex([0,1,2,0,2,3,3,2,5,3,5,4,0,3,4,1,5,2]);g.computeVertexNormals();const silver=mat(0xaeb8b6,{metalness:.45,roughness:.5});silver.map=tiles;silver.userData.tile=2;const roof=new THREE.Mesh(g,silver);roof.material.side=THREE.DoubleSide;roof.castShadow=true;scene.add(roof);
      box(.65,1.2,.65,sill,cx,h+2.5,cz+3);
      const plaque=box(.045,.45,.55,new THREE.MeshStandardMaterial({map:label('87','#e8e4cf','#253a35')}),minX-.04,1.8,cz);plaque.rotation.y=Math.PI/2;
    }
    features.push({...f,minX,maxX,minZ,maxZ,height:h});
    // Modest windows on each real wall edge, only in the near-road corridor.
    if(near.distance<85&&!small)for(let i=0;i<pts.length;i++) {
      const a=pts[i],b=pts[(i+1)%pts.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
      if(len<2.6)continue;
      for(let n=1;n<=Math.floor(len/3);n++)for(let floor=0;floor<Math.min(levels,5);floor++) {
        const t=n/(Math.floor(len/3)+1),wx=a[0]+dx*t,wz=a[1]+dz*t;
        const o=box(1.05,1.3,.035,windows,wx,1.65+floor*2.8,wz);o.rotation.y=Math.atan2(-dz,dx);o.castShadow=false;
        const angle=Math.atan2(-dz,dx);
        for(const [w,hh,ox,oy] of [[1.2,.07,0,.69],[1.2,.09,0,-.69],[.065,1.4,-.57,0],[.065,1.4,.57,0],[.045,1.3,0,0]]){const trim=box(w,hh,.09,frame,wx+Math.cos(angle)*ox,1.65+floor*2.8+oy,wz-Math.sin(angle)*ox);trim.rotation.y=angle;trim.castShadow=false;}
        const ledge=box(1.32,.08,.25,sill,wx, .91+floor*2.8,wz);ledge.rotation.y=angle;
      }
    }
    for(const object of scene.children.slice(buildingStart))object.userData.terrainAnchor=[cx,cz];
  }
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
  function tree(x,z,size=1,pine=false) {
    cylinder(.1*size,.2*size,3.6*size,M.trunk,x,1.8*size,z);
    if(pine){cylinder(0,1.25*size,4.3*size,M.darkleaf,x,4*size,z);}
    else {for(let i=0;i<4;i++){const o=new THREE.Mesh(new THREE.IcosahedronGeometry((1.4+random()*.55)*size,2),i%2?M.darkleaf:M.leaf);o.scale.set(1,.85+random()*.5,1);o.position.set(x+Math.cos(i*2.4)*size, (3.6+i*.45)*size,z+Math.sin(i*2.4)*size);o.castShadow=true;scene.add(o);}}
  }
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
    buildings:features,
  };
}
