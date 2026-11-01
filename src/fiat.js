import * as THREE from 'three';
import {carContactShadow} from './contact-details.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
// 1975-style 126p: measured proportions from The-Blueprints reference 1197.
export function createFiat(scene){
 const car=new THREE.Group(),chassis=new THREE.Group();scene.add(car);car.add(chassis);
 const paint=new THREE.MeshPhysicalMaterial({color:0xd3b16d,metalness:.28,roughness:.32,clearcoat:.8});
 const black=new THREE.MeshStandardMaterial({color:0x151919,roughness:.82}),chrome=new THREE.MeshStandardMaterial({color:0xb9c0bd,metalness:.88,roughness:.22});
 const glass=new THREE.MeshPhysicalMaterial({color:0x819a9b,transparent:true,opacity:.64,metalness:.18,roughness:.17,side:THREE.DoubleSide,depthWrite:false});
 const seatMat=new THREE.MeshStandardMaterial({color:0x403327,roughness:1});
 function mesh(g,m,parent=chassis){const o=new THREE.Mesh(g,m);o.castShadow=true;parent.add(o);return o;}
 function box(w,h,d,m,x,y,z,r=.008){const o=mesh(new RoundedBoxGeometry(w,h,d,3,r),m);o.position.set(x,y,z);return o;}
 function line(points,m=black,r=.004){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(path,Math.max(8,points.length*4),r,6,false),m);}
 function slab(shape,width,m){const g=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:24});g.rotateY(-Math.PI/2);g.translate(width/2,0,0);return mesh(g,m);}
 const s=new THREE.Shape();s.moveTo(-1.50,.25);s.lineTo(-1.205,.25);s.absarc(-.92,.25,.285,Math.PI,0,true);s.lineTo(.635,.25);s.absarc(.92,.25,.285,Math.PI,0,true);s.lineTo(1.50,.25);s.lineTo(1.51,.69);s.quadraticCurveTo(1.50,.76,1.42,.78);s.lineTo(.71,.835);s.lineTo(-.84,.85);s.lineTo(-1.43,.73);s.quadraticCurveTo(-1.51,.71,-1.50,.64);s.closePath();slab(s,1.345,paint);
 // Tapered steel cabin sides with separate, transparent glazing; no opaque backing.
 function pane(points){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();mesh(g,glass);line([...points,points[0]],black,.011);}
 const upperX=y=>.635-(y-.84)*.19;
 for(const sign of [-1,1]){
  const edge=[[-1.06,.85],[-.65,1.25],[-.51,1.302],[.38,1.302],[.53,1.25],[.83,.84]];
  const outer=new THREE.Shape();edge.forEach(([z,y],i)=>i?outer.lineTo(z,y):outer.moveTo(z,y));outer.closePath();
  // Outline itself is built from strips to preserve the window openings.
  for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];line([[sign*upperX(a[1]),a[1],a[0]],[sign*upperX(b[1]),b[1],b[0]]],paint,i===0?.05:.028);}
  const windows=[[[-.91,.90],[-.59,1.245],[-.18,1.245],[-.18,.90]],[[-.11,.90],[-.11,1.245],[.39,1.245],[.68,.90]]];
  for(const p of windows)pane(p.map(([z,y])=>[sign*(upperX(y)+.005),y,z]));
  line([[sign*.633,.85,-.14],[sign*.55,1.28,-.14]],paint,.027);
  // Door stamping, quarter vent, handles and belt line.
  line([[sign*.683,.81,.67],[sign*.686,.39,.57],[sign*.686,.32,.45],[sign*.686,.32,-.48],[sign*.686,.41,-.58],[sign*.683,.84,-.58]],black,.003);
  box(.024,.032,.13,chrome,sign*.693,.765,-.38,.008);
  for(let j=0;j<5;j++){const vent=box(.017,.014,.19,black,sign*.678,.84-j*.019,-1.02,.003);vent.rotation.x=.25;}
  line([[sign*.678,.83,-1.44],[sign*.687,.84,-.50],[sign*.683,.82,.78],[sign*.665,.73,1.48]],chrome,.007);
  box(.015,.035,1.3,black,sign*.679,.28,0,.005);
  box(.09,.09,.14,black,sign*.745,.94,.49,.025);
 }
 box(1.08,.052,.96,paint,0,1.30,-.06,.025);
 pane([[-.60,.89,.78],[.60,.89,.78],[.535,1.25,.46],[-.535,1.25,.46]]);
 pane([[-.59,.88,-1.02],[-.53,1.245,-.64],[.53,1.245,-.64],[.59,.88,-1.02]]);
 for(const x of [-.29,.29]){box(.40,.18,.39,seatMat,x,.43,.01,.045);box(.40,.37,.12,seatMat,x,.67,-.17,.04);}box(.98,.3,.28,seatMat,0,.51,-.65,.035);
 box(1.04,.13,.22,black,0,.78,.50,.02);
 const steering=mesh(new THREE.TorusGeometry(.14,.012,8,32),black);steering.position.set(.30,.87,.38);steering.rotation.x=-.35;
 for(const z of [-1.54,1.54]){box(1.38,.075,.105,chrome,0,.335,z,.018);for(const x of [-.42,.42])box(.045,.11,.12,black,x,.335,z,.008);}
 function lens(color){return new THREE.MeshPhysicalMaterial({color,roughness:.26,metalness:.1,clearcoat:1});}
 const red=lens(0x8f1f12),amber=lens(0xbf6817),white=lens(0xe3dcc0);
 for(const x of [-.50,.50]){
  box(.25,.20,.045,chrome,x,.635,1.518,.012);box(.22,.17,.05,white,x,.635,1.54,.012);
  box(.18,.075,.045,amber,x,.445,1.53,.005);
  // Characteristic narrow vertical rear lamps, not wide modern rectangles.
  box(.145,.285,.045,chrome,x,.565,-1.51,.018);
  box(.12,.085,.05,amber,x,.655,-1.535,.008);box(.12,.15,.05,red,x,.535,-1.535,.008);
  for(let k=0;k<5;k++)box(.115,.003,.004,chrome,x,.48+k*.026,-1.563,.001);
 }
 // Two banks of louvers directly below the rear window; central plate recess.
 for(const x of [-.30,.30])for(let j=0;j<5;j++)box(.39,.012,.019,black,x,.781-j*.008,-1.24-j*.04,.002);
 box(.39,.115,.012,black,0,.47,-1.521,.008);
 function text(txt,bg,fg,w,h){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=fg;ctx.textAlign='center';ctx.font='bold 65px monospace';ctx.fillText(txt,256,87);return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c)});}
 const plate=text('KRA 126P','#171b1a','#e2ded1');box(.36,.09,.009,plate,0,.47,-1.533,.001);box(.36,.09,.009,plate,0,.34,1.60,.001);
 box(.22,.035,.012,text('POLSKI FIAT','#aaa99c','#202624'),-.29,.815,-1.14,.001);box(.12,.035,.012,text('126p','#aaa99c','#202624'),.36,.815,-1.14,.001);
 box(.075,.075,.02,text('FIAT','#8e2620','#dedbce'),0,.70,1.53,.004);
 line([[-.23,.90,.775],[.19,.91,.77]],black,.006);line([[.15,.90,.775],[.47,.93,.74]],black,.006);
 const wheels=[];
 for(const x of [-.60,.60])for(const z of [-.92,.92]){
  const pivot=new THREE.Group(),tire=new THREE.Group(),hub=new THREE.Group();pivot.position.set(x,.245,z);pivot.add(tire,hub);car.add(pivot);
  const t=mesh(new THREE.TorusGeometry(.184,.061,16,48),black,tire);t.rotation.y=Math.PI/2;t.scale.z=1.1;
  const rim=mesh(new THREE.CylinderGeometry(.139,.139,.12,40),chrome,hub);rim.rotation.z=Math.PI/2;
  const cap=mesh(new THREE.SphereGeometry(.102,24,16),chrome,hub);cap.scale.set(.2,1,1);cap.position.x=Math.sign(x)*.073;
  for(let i=0;i<12;i++){let a=i*Math.PI/6;const hole=mesh(new THREE.SphereGeometry(.012,8,8),black,hub);hole.scale.x=.25;hole.position.set(Math.sign(x)*.065,Math.sin(a)*.12,Math.cos(a)*.12);}
  wheels.push({pivot,tire,hub,front:z>0});
 }
 carContactShadow(car);
 let brakeLightsActive=false;
 function updateVisuals({braking,steering:input}){brakeLightsActive=braking;red.emissive.set(braking?0xff1b04:0x000000);red.emissiveIntensity=braking?1.5:0;steering.rotation.z=-input*.9;}
 return {car,chassis,wheels,updateVisuals,get brakeLightsActive(){return brakeLightsActive;}};
}
