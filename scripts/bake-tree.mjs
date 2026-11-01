// Bake four directional impostor views from our reduced CC0 GLB. Requires Chromium.
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const server=spawn('npm',['run','dev','--','--port','5186'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,1500));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const p=await browser.newPage();
 await p.exposeFunction('bakeProgress',i=>console.log('Baked view',i+1,'/ 4'));
 await p.route('**/__bake_tree',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script><body></body>'}));
 await p.goto('http://127.0.0.1:5186/__bake_tree');
 const result=await p.evaluate(async modelUrl=>{
  const THREE=await import('three'),{GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),{HDRLoader}=await import('three/addons/loaders/HDRLoader.js');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(2048,512);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  const scene=new THREE.Scene(),gltf=await new GLTFLoader().loadAsync(modelUrl);const root=gltf.scene,box=new THREE.Box3().setFromObject(root),h=box.max.y-box.min.y;
  root.scale.setScalar(1/h);root.position.y=-box.min.y/h;scene.add(root);
  const sky=await new HDRLoader().loadAsync('/materials/kloofendal_48d_partly_cloudy_puresky/hdri.hdr');sky.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(sky).texture;scene.environmentIntensity=.65;scene.environmentRotation.y=.7;
  scene.add(new THREE.HemisphereLight(0xd3e1ed,0x6f775d,.65));const sun=new THREE.DirectionalLight(0xfff3dd,2.5);sun.position.set(-.75,1.4,.55);scene.add(sun);
  const camera=new THREE.OrthographicCamera(-.7,.7,1.15,-.25,.01,10);
  renderer.setScissorTest(true);
  for(let i=0;i<4;i++){const angle=i*Math.PI/2;camera.position.set(Math.sin(angle)*3,0,Math.cos(angle)*3);camera.lookAt(0,0,0);renderer.setViewport(i*512,0,512,512);renderer.setScissor(i*512,0,512,512);renderer.render(scene,camera);await window.bakeProgress(i);}
  return renderer.domElement.toDataURL('image/png');
 },'/vegetation/tree.glb');
 await writeFile('public/vegetation/tree-atlas.png',Buffer.from(result.split(',')[1],'base64'));
 const metadata=JSON.parse(await readFile('public/vegetation/sources.json','utf8')),atlas=await readFile('public/vegetation/tree-atlas.png');metadata.derived=metadata.derived.filter(f=>f.path!=='vegetation/tree-atlas.png');metadata.derived.push({path:'vegetation/tree-atlas.png',bytes:atlas.length,sha256:createHash('sha256').update(atlas).digest('hex')});await writeFile('public/vegetation/sources.json',JSON.stringify(metadata,null,2)+'\n');
 console.log('Baked directional tree atlas: public/vegetation/tree-atlas.png');
}finally{await browser.close();server.kill();}
