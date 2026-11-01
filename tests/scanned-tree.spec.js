import {test,expect} from '@playwright/test';
test('detailed GLB renders and only two nearby scanned trees use full geometry',async({page})=>{
 await page.route('**/__tree_test',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js"}}</script><body></body>'}));
 await page.goto('/__tree_test');
 const result=await page.evaluate(async()=>{
  const THREE=await import('three'),{treeAssets,scannedTreeRenderer}=await import('/src/scanned-trees.js');
  const assets=await treeAssets();await assets.loadDetail();const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x778866,2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-5,10,4);scene.add(sun);
  const plants=[0,7,30].map(x=>({x,z:0,size:1,rotation:0})),trees=scannedTreeRenderer(scene,assets,plants,{detailed:true}),camera=new THREE.PerspectiveCamera(50,1,.01,100);camera.position.set(3.5,3.25,17);camera.lookAt(3.5,3.25,0);trees.update(camera.position,new THREE.Vector3());
  const near=trees.detailCount;scene.traverse(o=>{if(o.isMesh&&o.material.isMeshBasicMaterial)o.visible=false;});
  const renderer=new THREE.WebGLRenderer({alpha:true});renderer.setSize(64,64);const target=new THREE.WebGLRenderTarget(64,64);renderer.setRenderTarget(target);renderer.render(scene,camera);const bytes=new Uint8Array(64*64*4);renderer.readRenderTargetPixels(target,0,0,64,64,bytes);let pixels=0;for(let i=0;i<bytes.length;i+=4)if(bytes[i]+bytes[i+1]+bytes[i+2]>0)pixels++;
  const error=renderer.getContext().getError();trees.update(camera.position,new THREE.Vector3(1000,0,1000));renderer.dispose();target.dispose();
  return {near,far:trees.detailCount,pixels,error,parts:assets.parts.length};
 });
 expect(result.parts).toBe(3);expect(result.near).toBe(2);expect(result.far).toBe(0);expect(result.pixels).toBeGreaterThan(30);expect(result.error).toBe(0);
});
