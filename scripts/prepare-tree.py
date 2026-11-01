import json,urllib.request,hashlib,concurrent.futures
from pathlib import Path
root=Path('/tmp/iwonicz-tree-source');root.mkdir(exist_ok=True)
ua={'User-Agent':'IwoniczRally/1.0 vegetation research'}
def fetch(u):
 with urllib.request.urlopen(urllib.request.Request(u,headers=ua),timeout=90) as r:return r.read()
files=json.loads(fetch('https://api.polyhaven.com/files/tree_small_02'));info=json.loads(fetch('https://api.polyhaven.com/info/tree_small_02'));meta=files['gltf']['1k']['gltf'];items=[('tree_small_02.gltf',meta)]+list(meta['include'].items())
def save(pair):
 name,f=pair;b=fetch(f['url']);assert hashlib.md5(b).hexdigest()==f['md5'],name
 p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 return {'name':name,'url':f['url'],'md5':f['md5'],'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:records=list(ex.map(save,items))
(root/'source.json').write_text(json.dumps({'id':'tree_small_02','license':'CC0-1.0','page':'https://polyhaven.com/a/tree_small_02','authors':info['authors'],'retrieved':'2026-11-01','originals':records},indent=2))
print('Verified source:',sum(f['bytes'] for f in records),'bytes',info['authors'])

# Keep verified originals in /tmp; only reduced assets are shipped to the browser.
import subprocess,shutil,struct
for command in [
 ['weld',str(root/'tree_small_02.gltf'),str(root/'weld.glb')],
 ['simplify',str(root/'weld.glb'),str(root/'detail.glb'),'--ratio','0.08','--error','0.003'],
 ['resize',str(root/'detail.glb'),str(root/'detail512.glb'),'--width','512','--height','512']]:
 subprocess.run(['npm','exec','--yes','--package','@gltf-transform/cli@4.5.1','--','gltf-transform',*command],check=True)
out=Path('public/vegetation');out.mkdir(parents=True,exist_ok=True)
shutil.copyfile(root/'detail512.glb',out/'tree.glb')
b=(out/'tree.glb').read_bytes();length=struct.unpack_from('<I',b,12)[0];gltf=json.loads(b[20:20+length]);triangles=sum(gltf['accessors'][p['indices']]['count']//3 for m in gltf['meshes'] for p in m['primitives'])
metadata=json.loads((root/'source.json').read_text());metadata['processing']={'tool':'@gltf-transform/cli@4.5.1','ratio':0.08,'error':0.003,'textureSize':512,'triangles':triangles}
metadata['derived']=[{'path':'vegetation/tree.glb','bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}]
(out/'sources.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('Prepared',triangles,'triangles;',len(b),'bytes. Run node scripts/bake-tree.mjs to regenerate atlas.')
