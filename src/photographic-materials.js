import * as THREE from 'three';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';

// Locally shipped CC0 photographs; source URLs, authors and hashes: /materials/sources.json.
export async function photographicMaterials(renderer,scene){
 const loader=new THREE.TextureLoader(),materials={};
 const specs={asphalt:['asphalt_04',3,.32],paving:['herringbone_pavement_02',2.48,.6],plaster:['white_plaster_02',1.5,.22],grass:['grass_ground',2.51,.45],slate:['roof_slates_02',3,.65]};
 await Promise.all(Object.entries(specs).map(async([key,[id,tile,normalStrength]])=>{
  const [map,normalMap,roughnessMap]=await Promise.all(['Diffuse','nor_gl','Rough'].map(name=>loader.loadAsync(`/materials/${id}/${name}.jpg`)));
  for(const texture of [map,normalMap,roughnessMap]){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
  map.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.MeshStandardMaterial({map,normalMap,normalScale:new THREE.Vector2(normalStrength,normalStrength),roughnessMap,roughness:1});m.userData.tile=tile;m.name=id;materials[key]=m;
 }));
 const sky=await new HDRLoader().loadAsync('/materials/kloofendal_48d_partly_cloudy_puresky/hdri.hdr');sky.mapping=THREE.EquirectangularReflectionMapping;
 const pmrem=new THREE.PMREMGenerator(renderer);const target=pmrem.fromEquirectangular(sky);pmrem.dispose();
 scene.environment=target.texture;scene.environmentIntensity=.65;scene.environmentRotation.y=.7;
 scene.background=sky;scene.backgroundIntensity=.65;scene.backgroundBlurriness=.03;scene.backgroundRotation.y=.7;
 return materials;
}
