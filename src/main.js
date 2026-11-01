import * as THREE from 'three';
import './style.css';
import { createWorld, data } from './world.js';
import { geographicPosition } from './geography.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const $ = id => document.getElementById(id);
const renderer = new THREE.WebGLRenderer({canvas:$('game'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xd9e3df);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xd9e3df,100,490);
const camera=new THREE.PerspectiveCamera(47,innerWidth/innerHeight,.1,1400);
scene.add(new THREE.HemisphereLight(0xf4f5e8,0x80946e,2.6));
const sun=new THREE.DirectionalLight(0xffead0,3.1);sun.position.set(-75,140,55);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;sun.shadow.camera.far=400;sun.shadow.bias=-.0005;scene.add(sun);scene.add(sun.target);
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...extra});
const M={grass:mat(0x9ba980),road:mat(0x717872),curb:mat(0xd3cdbb),walk:mat(0xcac6b3),trunk:mat(0x73654c),leaf:mat(0x6f885d),darkleaf:mat(0x506d50),cream:mat(0xeee3c8),roof:mat(0x79746b),trim:mat(0xe5e1cd),glass:mat(0x6b9295,{metalness:.28,roughness:.22}),red:mat(0xcd5c36,{metalness:.18,roughness:.38}),tire:mat(0x29302d),chrome:mat(0xbcc4bd,{metalness:.75,roughness:.28}),black:mat(0x343d36)};
function box(w,h,d,m,x=0,y=0,z=0,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function cylinder(r1,r2,h,m,x,y,z,parent=scene,n=8){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function label(text,bg='#e9e3ca',fg='#3f5147'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.strokeStyle=fg;ctx.lineWidth=8;ctx.strokeRect(9,9,494,110);ctx.fillStyle=fg;ctx.font='bold '+Math.min(44,Math.floor(800/text.length))+'px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,80);return new THREE.CanvasTexture(c);}
const world=createWorld(scene,{mat,M,box,cylinder,label});
const spawn=world.routeAt(30);
// Batch the static scenery to keep draw calls low on integrated GPUs.
scene.updateMatrixWorld(true);
const batches=new Map(),staticMeshes=[];
scene.traverse(o=>{if(o.isMesh){const key=o.material.uuid+":"+Math.floor(o.getWorldPosition(new THREE.Vector3()).z/60); if(!batches.has(key))batches.set(key,{material:o.material,geometries:[]});let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();if(!g.getAttribute("uv"))g.setAttribute("uv",new THREE.Float32BufferAttribute(new Float32Array(g.getAttribute("position").count*2),2));g.applyMatrix4(o.matrixWorld);batches.get(key).geometries.push(g);staticMeshes.push(o);}});
for(const o of staticMeshes)o.removeFromParent();
for(const {material,geometries} of batches.values()){const g=mergeGeometries(geometries);const o=new THREE.Mesh(g,material);o.castShadow=true;o.receiveShadow=true;scene.add(o);for(const part of geometries)part.dispose();}
// A compact, rear-engined Fiat 126p, facing positive Z.
const car=new THREE.Group();scene.add(car);const chassis=new THREE.Group();car.add(chassis);
box(1.39,.54,2.88,M.red,0,.67,0,chassis);box(1.35,.17,2.7,M.red,0,.99,0,chassis);
box(1.28,.12,.82,M.red,0,1.04,1.03,chassis);box(1.28,.12,.56,M.red,0,1.04,-1.14,chassis);
box(1.23,.1,1.32,M.red,0,1.77,-.12,chassis);
const wind=box(1.13,.64,.045,M.glass,0,1.41,.63,chassis);wind.rotation.x=-.19;
const rear=box(1.13,.58,.045,M.glass,0,1.39,-.86,chassis);rear.rotation.x=.18;
for(let side of [-1,1]){box(.045,.58,1.23,M.glass,side*.614,1.42,-.12,chassis);for(let zz of [-.84,-.07,.62])box(.065,.68,.065,M.red,side*.64,1.41,zz,chassis);box(.07,.055,1.48,M.chrome,side*.664,1.08,-.1,chassis);box(.045,.055,.19,M.chrome,side*.706,.98,-.38,chassis);box(.15,.13,.23,M.black,side*.79,1.18,.49,chassis);}
box(1.5,.13,.13,M.chrome,0,.47,1.5,chassis);box(1.5,.13,.13,M.chrome,0,.47,-1.5,chassis);
for(const x of [-.48,.48]){box(.28,.24,.05,mat(0xffefb0),x,.78,1.46,chassis);box(.2,.19,.05,mat(0xb73724),x,.78,-1.46,chassis);box(.18,.09,.055,mat(0xe69b35),x,.55,1.47,chassis);}
for(let i=0;i<7;i++)box(.68,.025,.018,M.black,0,.93-i*.045,-1.452,chassis);
box(.43,.13,.025,new THREE.MeshStandardMaterial({map:label('KRA 126P','#ede8d9','#27362e')}),0,.53,-1.577,chassis);
const wheels=[];for(let x of [-.72,.72])for(let z of [-.91,.92]){const pivot=new THREE.Group();pivot.position.set(x,.37,z);chassis.add(pivot);const tire=cylinder(.3,.3,.18,M.tire,0,0,0,pivot,16);tire.rotation.z=Math.PI/2;const hub=cylinder(.16,.16,.19,M.chrome,0,0,0,pivot,12);hub.rotation.z=Math.PI/2;wheels.push({pivot,tire,hub,front:z>0});}
let speed=0,heading=spawn.heading,travel=0,steer=0,camMode=0;
const keys=new Set();const uiKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyR','KeyC']);
function reset(){speed=0;heading=spawn.heading;travel=0;steer=0;car.position.set(spawn.x-1.35*Math.cos(heading),0,spawn.z+1.35*Math.sin(heading));car.rotation.y=heading;camera.position.copy(car.position).add(new THREE.Vector3(innerWidth<800?-1.8:-5.6,4.6,innerWidth<800?-11:-9.3).applyAxisAngle(new THREE.Vector3(0,1,0),heading));}
function cycleCamera(){camMode=(camMode+1)%2;}
addEventListener('keydown',e=>{if($('sourceDialog').open)return;if(uiKeys.has(e.code))e.preventDefault();keys.add(e.code);if(!e.repeat&&e.code==='KeyR')reset();if(!e.repeat&&e.code==='KeyC')cycleCamera();});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
$('camera').onclick=cycleCamera;$('sources').onclick=()=>{keys.clear();$('sourceDialog').showModal();};$('closeDialog').onclick=()=>$('sourceDialog').close();
for(const button of document.querySelectorAll('[data-key]')){button.onpointerdown=e=>{e.preventDefault();if(e.isTrusted)button.setPointerCapture(e.pointerId);keys.add(button.dataset.key);};for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>keys.delete(button.dataset.key));}
let audio,osc,gain,soundOn=false;$('sound').onclick=()=>{if(!audio){audio=new AudioContext();osc=audio.createOscillator();osc.type='sawtooth';gain=audio.createGain();const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=210;osc.connect(filter);filter.connect(gain);gain.connect(audio.destination);gain.gain.value=0;osc.start();}audio.resume();soundOn=!soundOn;$('sound').textContent='DŹWIĘK: '+(soundOn?'WŁ.':'WYŁ.');};
const map=$('minimap'),ctx=map.getContext('2d');
function minimap(){
  ctx.clearRect(0,0,map.width,map.height);ctx.fillStyle='#e7e9db';ctx.fillRect(0,0,map.width,map.height);
  const scale=.55,project=([x,z])=>[110-(x-car.position.x)*scale,110-(z-car.position.z)*scale];
  function line(points,color,width){ctx.beginPath();points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  for(const f of data.landcover.filter(f=>f.tags.landuse==='forest'||f.tags.natural==='wood')){ctx.beginPath();f.points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.fillStyle='#cbd7bd';ctx.fill();}
  for(const f of data.waterways)line(f.points,'#96bfc2',2);
  for(const f of data.roads)line(f.points,'#f5f3e8',3);
  for(const f of data.buildings){ctx.beginPath();f.points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.fillStyle='#b9bea9';ctx.fill();}
  line(data.route,'#b5b4a2',7);line(data.route,'#fff9e5',4);
  ctx.save();ctx.translate(110,110);ctx.rotate(-heading);ctx.fillStyle='#c7643b';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(6,7);ctx.lineTo(0,4);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();ctx.restore();
  const position=geographicPosition(data.origin,car.position.x,car.position.z),progress=world.nearest(car.position.x,car.position.z);
  $('coordinates').textContent=position.lat.toFixed(5)+'° N · '+position.lon.toFixed(5)+'° E';
  $('route-progress').textContent=Math.round(progress.s)+' / '+Math.round(data.length)+' m';
}
let collisionAt=0;function notify(text){$('notice').textContent=text;$('notice').style.opacity=1;collisionAt=performance.now();}
const clock=new THREE.Timer();let elapsed=0,started=false;reset();
function animate(){requestAnimationFrame(animate);clock.update();const dt=Math.min(clock.getDelta(),.15);elapsed+=dt;const paused=$('sourceDialog').open;const throttle=!paused&&keys.has('ArrowUp'),reverse=!paused&&keys.has('ArrowDown');if(!paused){if(throttle)speed+= (speed<0?9:4.4)*dt;if(reverse)speed-=(speed>0?10:3)*dt;if(keys.has('Space'))speed*=Math.exp(-6*dt);speed*=Math.exp(-(.16+(!world.onRoad(car.position.x,car.position.z)?1.4:0))*dt);speed=THREE.MathUtils.clamp(speed,-5.5,20);if(Math.abs(speed)<.025)speed=0;let target=(keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0);steer=THREE.MathUtils.damp(steer,target,7,dt);heading+=steer*speed*.038*dt;const nx=car.position.x+Math.sin(heading)*speed*dt,nz=car.position.z+Math.cos(heading)*speed*dt;const stepCount=Math.max(1,Math.ceil(Math.abs(speed)*dt/.5));const hit=Array.from({length:stepCount},(_,i)=>(i+1)/stepCount).some(t=>world.collides(car.position.x+(nx-car.position.x)*t,car.position.z+(nz-car.position.z)*t));if(hit){speed*=-.35;notify('Spokojnie, to zabytkowy maluch. R — powrót na drogę.');}else if(world.nearest(nx,nz).distance>65||nz<data.route[0][1]-8||nz>data.route.at(-1)[1]+8){speed*=-.5;notify('Granica odtworzonej okolicy. Zawróć lub naciśnij R.');}else{car.position.x=nx;car.position.z=nz;travel+=Math.abs(speed)*dt;}car.rotation.y=heading;chassis.rotation.z=THREE.MathUtils.damp(chassis.rotation.z,steer*speed*.003,5,dt);chassis.position.y=Math.sin(elapsed*21)*Math.min(Math.abs(speed)*.001,.012);for(const w of wheels){w.pivot.rotation.y=w.front?steer*.33:0;w.tire.rotation.x+=speed*dt/.3;w.hub.rotation.x+=speed*dt/.3;}}
if(throttle&&!started){started=true;$('notice').style.opacity=0;}if(collisionAt&&performance.now()-collisionAt>4500){$('notice').style.opacity=0;collisionAt=0;}
const behind=camMode?new THREE.Vector3(0,1.58,.29):new THREE.Vector3(innerWidth<800?-1.8:-5.6,4.6,innerWidth<800?-11:-9.3);behind.applyAxisAngle(new THREE.Vector3(0,1,0),heading).add(car.position);camera.position.lerp(behind,1-Math.exp(-dt*(camMode?18:3)));const look=car.position.clone().add(new THREE.Vector3(Math.sin(heading)*(camMode?30:6),camMode?1.32:1.2,Math.cos(heading)*(camMode?30:6)));camera.lookAt(look);sun.position.set(car.position.x-75,140,car.position.z+55);sun.target.position.copy(car.position);
$('speed').textContent=String(Math.round(Math.abs(speed)*3.6)).padStart(2,'0');$('gear').textContent=speed<-.2?'R':speed<.2?'N':speed<5?'1':speed<10?'2':speed<16?'3':'4';$('distance').textContent=(travel/1000).toFixed(2);if(audio){osc.frequency.setTargetAtTime(30+Math.abs(speed)*5+(throttle?12:0),audio.currentTime,.1);gain.gain.setTargetAtTime(soundOn&&!paused?.022:0,audio.currentTime,.1);}minimap();renderer.render(scene,camera);window.__driving={speed,x:car.position.x,z:car.position.z,distance:travel,camera:camMode,ready:true,routeLength:data.length,routeProgress:world.nearest(car.position.x,car.position.z).s,buildingCount:data.buildings.length,geographic:geographicPosition(data.origin,car.position.x,car.position.z)};}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});animate();
