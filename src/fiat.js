import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
// Early 126 proportions: 3.054 × 1.377 × 1.335 m, wheelbase 1.840 m.
export function createFiat(scene) {
 const car=new THREE.Group(),chassis=new THREE.Group();car.add(chassis);scene.add(car);
 const paint=new THREE.MeshPhysicalMaterial({color:0xa94126,roughness:.29,metalness:.35,clearcoat:.85,clearcoatRoughness:.24});
 const rubber=new THREE.MeshStandardMaterial({color:0x171b1b,roughness:.92});
 const chrome=new THREE.MeshStandardMaterial({color:0xc5c9c5,metalness:.85,roughness:.22});
 const glass=new THREE.MeshPhysicalMaterial({color:0x728d91,roughness:.16,metalness:.15,transparent:true,opacity:.52,side:THREE.DoubleSide});
 const black=new THREE.MeshStandardMaterial({color:0x2d302b,roughness:.8});
 function rounded(w,h,d,m,x,y,z,r=.02){const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,r),m);o.position.set(x,y,z);o.castShadow=true;chassis.add(o);return o;}
 function profile(points,width,material,x=0,bevel=0){const s=new THREE.Shape();points.forEach(([z,y],i)=>i?s.lineTo(z,y):s.moveTo(z,y));s.closePath();return extrude(s,width,material,x,bevel);}
 function extrude(shape,width,material,x=0,bevel=0){const g=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1,curveSegments:18});g.rotateY(-Math.PI/2);g.translate(x+width/2,0,0);const o=new THREE.Mesh(g,material);o.castShadow=true;chassis.add(o);return o;}
 const body=new THREE.Shape();body.moveTo(-1.5,.28);body.lineTo(-1.22,.28);body.absarc(-.92,.28,.30,Math.PI,0,true);body.lineTo(.62,.28);body.absarc(.92,.28,.30,Math.PI,0,true);body.lineTo(1.5,.28);body.lineTo(1.5,.73);body.quadraticCurveTo(1.49,.80,1.39,.81);body.lineTo(.65,.85);body.lineTo(-.94,.85);body.lineTo(-1.48,.78);body.closePath();extrude(body,1.34,paint,0,.015);
 for(const side of [-1,1]){
  for(const [[z1,y1],[z2,y2]] of [[[-.98,.85],[-.67,1.31]],[[.77,.85],[.43,1.31]],[[-.11,.85],[-.11,1.31]]]){
   const a=new THREE.Vector3(side*.60,y1,z1),b=new THREE.Vector3(side*.56,y2,z2);const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,a.distanceTo(b),8),paint);pillar.position.copy(a).add(b).multiplyScalar(.5);pillar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());chassis.add(pillar);
  }
 }
 rounded(1.13,.045,1.04,paint,0,1.335,-.12,.02);
 // Trapezoid side glazing with rear quarter window and narrow rubber seals.
 for(const side of [-1,1]){
  for(const pts of [[[-.89,.90],[-.66,1.26],[-.14,1.26],[-.14,.90]],[[-.08,.90],[-.08,1.26],[.39,1.26],[.68,.90]]]){
   profile(pts,.018,rubber,side*.61);const cx=pts.reduce((s,p)=>s+p[0],0)/4,cy=pts.reduce((s,p)=>s+p[1],0)/4;profile(pts.map(([z,y])=>[cx+(z-cx)*.93,cy+(y-cy)*.88]),.02,glass,side*.623);
  }
  rounded(.018,.018,1.65,chrome,side*.682,.85,-.05,.005);
  rounded(.023,.029,.14,chrome,side*.692,.77,-.28,.008);
  rounded(.07,.11,.17,black,side*.742,.92,.52,.025);
  // Door seam and lower sill.
  profile([[-.59,.34],[-.59,.81],[-.583,.81],[-.583,.34]],.006,black,side*.683);
  rounded(.018,.045,1.2,paint,side*.674,.31,.04,.008);
 }
 function pane(points,material){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const o=new THREE.Mesh(g,material);chassis.add(o);}
 pane([[-.565,.9,.77],[.565,.9,.77],[.535,1.275,.44],[-.535,1.275,.44]],glass);
 pane([[-.565,.9,-.96],[-.535,1.265,-.70],[.535,1.265,-.70],[.565,.9,-.96]],glass);
 for(const side of [-1,1]){rounded(.40,.32,.40,black,side*.29,.49,.01,.05);const seat=rounded(.40,.42,.12,black,side*.29,.75,-.17,.04);seat.rotation.x=-.13;}
 rounded(1.05,.15,.22,black,0,.84,.48,.025);rounded(1.0,.25,.35,black,0,.56,-.66,.03);
 const steering=new THREE.Mesh(new THREE.TorusGeometry(.145,.012,8,28),black);steering.position.set(.30,.89,.34);steering.rotation.x=-.4;chassis.add(steering);
 for(const z of [-1.54,1.54]){rounded(1.40,.105,.115,chrome,0,.37,z,.025);for(const x of [-.43,.43])rounded(.045,.13,.14,rubber,x,.37,z,.01);}
 function lens(color){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,64,64);ctx.strokeStyle='#ffffff44';for(let x=0;x<64;x+=5){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,64);ctx.stroke();}return new THREE.MeshPhysicalMaterial({map:new THREE.CanvasTexture(c),roughness:.22,metalness:.12,clearcoat:1});}
 const head=lens('#efe5bd'),red=lens('#9f2016'),amber=lens('#dc851d');
 for(const x of [-.47,.47]){rounded(.29,.25,.045,rubber,x,.66,1.512,.025);rounded(.25,.21,.05,head,x,.66,1.53,.025);rounded(.20,.10,.035,amber,x,.45,1.52,.008);rounded(.24,.19,.04,rubber,x,.63,-1.52,.01);rounded(.21,.115,.045,red,x,.60,-1.54,.01);rounded(.21,.05,.045,amber,x,.69,-1.54,.006);}
 for(let i=0;i<8;i++)rounded(.63,.014,.014,rubber,0,.78-i*.027,-1.52,.003);
 for(let i=0;i<8;i++)rounded(.38,.008,.012,rubber,-.39,.865,-.65+i*.027,.002);
 rounded(.11,.11,.02,chrome,0,.7,1.535,.008);
 const badgeCanvas=document.createElement('canvas');badgeCanvas.width=256;badgeCanvas.height=64;const ctx=badgeCanvas.getContext('2d');ctx.fillStyle='#191e1c';ctx.fillRect(0,0,256,64);ctx.fillStyle='#e4e1cb';ctx.font='bold 36px monospace';ctx.textAlign='center';ctx.fillText('KRA 126P',128,44);const plate=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(badgeCanvas)});
 for(const z of [-1.607,1.607])rounded(.36,.095,.01,plate,0,.37,z,.002);
 const wheels=[];
 for(const x of [-.60,.60])for(const z of [-.92,.92]){
  const pivot=new THREE.Group();pivot.position.set(x,.25,z);chassis.add(pivot);
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.135,40),rubber);tire.rotation.z=Math.PI/2;pivot.add(tire);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.135,.135,.142,32),chrome);hub.rotation.z=Math.PI/2;pivot.add(hub);
  const side=x>0?1:-1;
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.10,24,12),chrome);cap.scale.set(.22,1,1);cap.position.x=side*.083;pivot.add(cap);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const hole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.147,8),black);hole.rotation.z=Math.PI/2;hole.position.set(0,Math.sin(a)*.11,Math.cos(a)*.11);pivot.add(hole);}
  wheels.push({pivot,tire,hub,front:z>0});
 }
 return {car,chassis,wheels};
}
