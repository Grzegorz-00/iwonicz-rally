import * as THREE from 'three';
import './style.css';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const $ = id => document.getElementById(id);
const renderer = new THREE.WebGLRenderer({canvas:$('game'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xd9e3df);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xd9e3df,100,490);
const camera=new THREE.PerspectiveCamera(47,innerWidth/innerHeight,.1,1400);
scene.add(new THREE.HemisphereLight(0xf4f5e8,0x80946e,2.6));
const sun=new THREE.DirectionalLight(0xffead0,3.1);sun.position.set(-75,140,55);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;sun.shadow.camera.far=400;sun.shadow.bias=-.0005;scene.add(sun);scene.add(sun.target);
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.88,...extra});
const M={grass:mat(0x9ba980),road:mat(0x717872),curb:mat(0xd3cdbb),walk:mat(0xcac6b3),trunk:mat(0x73654c),leaf:mat(0x6f885d),darkleaf:mat(0x506d50),cream:mat(0xeee3c8),roof:mat(0x79746b),trim:mat(0xe5e1cd),glass:mat(0x6b9295,{metalness:.28,roughness:.22}),red:mat(0xcd5c36,{metalness:.18,roughness:.38}),tire:mat(0x29302d),chrome:mat(0xbcc4bd,{metalness:.75,roughness:.28}),black:mat(0x343d36)};
function box(w,h,d,m,x=0,y=0,z=0,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function cylinder(r1,r2,h,m,x,y,z,parent=scene,n=8){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
let seed=126;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const roadX=z=>Math.sin(z/125)*19+Math.sin(z/53)*3;
const roadAngle=z=>Math.atan((roadX(z+.1)-roadX(z-.1))/.2);
const start=-90,end=820;
box(1600,1,1800,M.grass,0,-.65,350);
function ribbon(offset,width,material,y){const verts=[],idx=[];for(let i=0;i<=455;i++){const z=start-20+i*2.1,x=roadX(z);verts.push(x+offset-width/2,y,z,x+offset+width/2,y,z);if(i<455){let a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(idx);g.computeVertexNormals();const o=new THREE.Mesh(g,material);o.receiveShadow=true;scene.add(o);}
ribbon(0,8.5,M.road,.025);for(const side of [-1,1]){ribbon(side*4.5,.5,M.curb,.12);ribbon(side*5.9,2.3,M.walk,.08);ribbon(side*7.2,.12,M.curb,.13);}
const lineMat=mat(0xe3dfc8);for(let z=start;z<end;z+=12){const l=box(.11,.015,4,lineMat,roadX(z),.045,z);l.rotation.y=roadAngle(z);}
const obstacles=[];
function building(z,side,w,d,h,color,wood=false){const group=new THREE.Group();const x=roadX(z)+side*(11+d/2);group.position.set(x,0,z);group.rotation.y=side===1?Math.PI/2:-Math.PI/2;scene.add(group);box(w,h,d,mat(color),0,h/2,0,group);box(w+.3,.3,d+.3,M.trim,0,.25,0,group);box(w+.4,.25,d+.4,M.trim,0,h-.3,0,group);
 const roofShape=new THREE.Shape();roofShape.moveTo(-w/2-.7,0);roofShape.lineTo(0,3.1);roofShape.lineTo(w/2+.7,0);roofShape.closePath();const rg=new THREE.ExtrudeGeometry(roofShape,{depth:d+1.2,bevelEnabled:false});const roof=new THREE.Mesh(rg,wood?mat(0x6d6658):M.roof);roof.position.set(0,h,-d/2-.6);roof.castShadow=true;group.add(roof);
 for(let floor=0;floor<Math.floor(h/3);floor++)for(let xx=-w/2+1.5;xx<w/2-1;xx+=2.6){box(1.25,1.8,.16,M.trim,xx,2+floor*3,-d/2-.09,group);box(.93,1.43,.18,M.glass,xx,2+floor*3,-d/2-.2,group);box(.07,1.45,.2,M.trim,xx,2+floor*3,-d/2-.32,group);box(1,.07,.2,M.trim,xx,2+floor*3,-d/2-.32,group);if(wood){box(1.9,.12,.7,M.trim,xx,1+floor*3,-d/2-.4,group);}}
 box(1.6,2.4,.18,M.black,0,1.2,-d/2-.22,group);
 if(wood){for(let yy=1;yy<h;yy+=.45)box(w+.02,.045,d+.02,mat(0xb29f7a),0,yy,0,group);for(let xx of [-w/2+.3,w/2-.3])box(.18,h,.18,M.trim,xx,h/2,-d/2-.25,group);}
 obstacles.push({x,z,hx:d/2+.3,hz:w/2+.3});
}
for(let z=-55;z<800;z+=37){for(const side of [-1,1]){if(random()<.23)continue;building(z+random()*10,side,10+random()*7,8+random()*4,6+Math.floor(random()*2)*3,[0xe9dfc2,0xe5d3b1,0xd9dcc4,0xf0e6cd,0xd8c8ae][Math.floor(random()*5)],random()>.4);}}
function tree(x,z,s=1,pine=false){const y=0;const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);cylinder(.15*s,.27*s,3.7*s,M.trunk,0,1.8*s,0,g);if(pine){for(let i=0;i<3;i++)cylinder((.15)*s,(2.2-i*.4)*s,3.6*s,i%2?M.darkleaf:M.leaf,0,(4+i*1.6)*s,0,g);}else{for(let i=0;i<3;i++){const o=new THREE.Mesh(new THREE.IcosahedronGeometry((2.4-i*.2)*s,1),i%2?M.darkleaf:M.leaf);o.position.set((i-1)*.8*s,(4.3+i*.7)*s,Math.sin(i*3)*s);o.castShadow=true;g.add(o);}}}
for(let z=-90;z<850;z+=11){for(const side of [-1,1]){tree(roadX(z)+side*(8.7+random()*1.2),z,.7+random()*.4,random()>.7);for(let k=0;k<2;k++)tree(side*(38+random()*100),z+random()*20,1+random()*1.2,random()>.55);}}
// Layered wooded ridges form the Beskid horizon.
for(let i=0;i<18;i++){const g=new THREE.ConeGeometry(110+random()*140,100+random()*90,8);const o=new THREE.Mesh(g,mat(i%2?0x90a68d:0x7f9b88));o.position.set((i%2?1:-1)*(170+random()*200),25,random()*1300-150);scene.add(o);}
function label(text,bg='#e9e3ca',fg='#3f5147'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.strokeStyle=fg;ctx.lineWidth=8;ctx.strokeRect(9,9,494,110);ctx.fillStyle=fg;ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,80);return new THREE.CanvasTexture(c);}
const sign=new THREE.Group();sign.position.set(roadX(6)+6.8,0,6);sign.rotation.y=Math.PI;scene.add(sign);cylinder(.05,.05,3,M.chrome,0,1.5,0,sign);box(2.4,.65,.08,new THREE.MeshStandardMaterial({map:label('ul. Zdrojowa')}),0,2.75,0,sign);
for(let z=-40;z<800;z+=46){const x=roadX(z)-6.6;cylinder(.06,.09,5.3,M.black,x,2.65,z);box(1.1,.1,.1,M.black,x+.45,5.2,z);box(.5,.17,.3,M.cream,x+.9,5.1,z);const bench=new THREE.Group();bench.position.set(roadX(z)+6.3,0,z+13);bench.rotation.y=Math.PI/2;scene.add(bench);box(2,.12,.6,mat(0x927d57),0,.6,0,bench);box(2,.55,.1,mat(0x927d57),0,1,-.3,bench);for(let xx of [-.75,.75])box(.1,.6,.5,M.black,xx,.3,0,bench);}
// Batch the static scenery to keep draw calls low on integrated GPUs.
scene.updateMatrixWorld(true);
const batches=new Map(),staticMeshes=[];
scene.traverse(o=>{if(o.isMesh){const key=o.material.uuid+":"+Math.floor(o.getWorldPosition(new THREE.Vector3()).z/60); if(!batches.has(key))batches.set(key,{material:o.material,geometries:[]});let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);batches.get(key).geometries.push(g);staticMeshes.push(o);}});
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
let speed=0,heading=roadAngle(0),travel=0,steer=0,camMode=0;car.position.set(roadX(0),0,0);car.rotation.y=heading;
const keys=new Set();const uiKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyR','KeyC']);
function reset(){speed=0;heading=roadAngle(0);travel=0;car.position.set(roadX(0),0,0);car.rotation.y=heading;camera.position.copy(car.position).add(new THREE.Vector3(-10,6,-15));}
function cycleCamera(){camMode=(camMode+1)%2;}
addEventListener('keydown',e=>{if($('sourceDialog').open)return;if(uiKeys.has(e.code))e.preventDefault();keys.add(e.code);if(!e.repeat&&e.code==='KeyR')reset();if(!e.repeat&&e.code==='KeyC')cycleCamera();});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
$('camera').onclick=cycleCamera;$('sources').onclick=()=>{keys.clear();$('sourceDialog').showModal();};$('closeDialog').onclick=()=>$('sourceDialog').close();
for(const button of document.querySelectorAll('[data-key]')){button.onpointerdown=e=>{e.preventDefault();if(e.isTrusted)button.setPointerCapture(e.pointerId);keys.add(button.dataset.key);};for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>keys.delete(button.dataset.key));}
let audio,osc,gain,soundOn=false;$('sound').onclick=()=>{if(!audio){audio=new AudioContext();osc=audio.createOscillator();osc.type='sawtooth';gain=audio.createGain();const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=210;osc.connect(filter);filter.connect(gain);gain.connect(audio.destination);gain.gain.value=0;osc.start();}audio.resume();soundOn=!soundOn;$('sound').textContent='DŹWIĘK: '+(soundOn?'WŁ.':'WYŁ.');};
const map=$('minimap'),ctx=map.getContext('2d');function minimap(){const w=map.width,h=map.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#e7e9db';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d4dcc9';ctx.lineWidth=18;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(30+i*45,40+(i%2)*75,30,55,.4,0,Math.PI*2);ctx.stroke();}const transform=z=>({x:110+(roadX(z)-roadX(car.position.z))*.95,y:95-(z-car.position.z)*.7});ctx.beginPath();for(let z=car.position.z-150;z<car.position.z+150;z+=2){const p=transform(z);if(z===car.position.z-150)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.strokeStyle='#c7c8b8';ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle='#faf6e9';ctx.lineWidth=8;ctx.stroke();ctx.fillStyle='#b4bea6';for(let z=car.position.z-130;z<car.position.z+130;z+=27){let p=transform(z);ctx.fillRect(p.x-23,p.y,9,12);ctx.fillRect(p.x+16,p.y+9,13,9);}const p={x:110+(car.position.x-roadX(car.position.z))*.95,y:95};ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-heading);ctx.fillStyle='#c7643b';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(6,7);ctx.lineTo(0,4);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();ctx.restore();}
let collisionAt=0;function notify(text){$('notice').textContent=text;$('notice').style.opacity=1;collisionAt=performance.now();}
const clock=new THREE.Clock();let elapsed=0,started=false;reset();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.15);elapsed+=dt;const paused=$('sourceDialog').open;const throttle=!paused&&keys.has('ArrowUp'),reverse=!paused&&keys.has('ArrowDown');if(!paused){if(throttle)speed+= (speed<0?9:4.4)*dt;if(reverse)speed-=(speed>0?10:3)*dt;if(keys.has('Space'))speed*=Math.exp(-6*dt);speed*=Math.exp(-(.16+(Math.abs(car.position.x-roadX(car.position.z))>4.2?1.4:0))*dt);speed=THREE.MathUtils.clamp(speed,-5.5,20);if(Math.abs(speed)<.025)speed=0;let target=(keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0);steer=THREE.MathUtils.damp(steer,target,7,dt);heading+=steer*speed*.038*dt;const nx=car.position.x+Math.sin(heading)*speed*dt,nz=car.position.z+Math.cos(heading)*speed*dt;const hit=obstacles.some(o=>Math.abs(nx-o.x)<o.hx+.7&&Math.abs(nz-o.z)<o.hz+1.25);if(hit){speed*=-.35;notify('Spokojnie, to zabytkowy maluch. R — powrót na drogę.');}else if(nz<start+5||nz>end-5||Math.abs(nx-roadX(nz))>45){speed*=-.5;notify('Koniec trasy poglądowej. Zawróć lub naciśnij R.');}else{car.position.x=nx;car.position.z=nz;travel+=Math.abs(speed)*dt;}car.rotation.y=heading;chassis.rotation.z=THREE.MathUtils.damp(chassis.rotation.z,steer*speed*.003,5,dt);chassis.position.y=Math.sin(elapsed*21)*Math.min(Math.abs(speed)*.001,.012);for(const w of wheels){w.pivot.rotation.y=w.front?steer*.33:0;w.tire.rotation.x+=speed*dt/.3;w.hub.rotation.x+=speed*dt/.3;}}
if(throttle&&!started){started=true;$('notice').style.opacity=0;}if(collisionAt&&performance.now()-collisionAt>4500){$('notice').style.opacity=0;collisionAt=0;}
const behind=camMode?new THREE.Vector3(0,1.58,.29):new THREE.Vector3(innerWidth<800?-1.8:-5.6,4.6,innerWidth<800?-11:-9.3);behind.applyAxisAngle(new THREE.Vector3(0,1,0),heading).add(car.position);camera.position.lerp(behind,1-Math.exp(-dt*(camMode?18:3)));const look=car.position.clone().add(new THREE.Vector3(Math.sin(heading)*(camMode?30:6),camMode?1.32:1.2,Math.cos(heading)*(camMode?30:6)));camera.lookAt(look);sun.position.set(car.position.x-75,140,car.position.z+55);sun.target.position.copy(car.position);
$('speed').textContent=String(Math.round(Math.abs(speed)*3.6)).padStart(2,'0');$('gear').textContent=speed<-.2?'R':speed<.2?'N':speed<5?'1':speed<10?'2':speed<16?'3':'4';$('distance').textContent=(travel/1000).toFixed(2);if(audio){osc.frequency.setTargetAtTime(30+Math.abs(speed)*5+(throttle?12:0),audio.currentTime,.1);gain.gain.setTargetAtTime(soundOn&&!paused?.022:0,audio.currentTime,.1);}minimap();renderer.render(scene,camera);window.__driving={speed,x:car.position.x,z:car.position.z,distance:travel,camera:camMode,ready:true};}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});animate();
