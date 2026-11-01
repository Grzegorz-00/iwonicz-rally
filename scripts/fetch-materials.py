#!/usr/bin/env python3
"""Fetch selected, original Poly Haven 1K files (CC0); verify provider MD5 and record SHA256."""
import urllib.request,json,hashlib,concurrent.futures
from pathlib import Path
ROOT=Path('public/materials');ROOT.mkdir(exist_ok=True,parents=True)
UA={'User-Agent':'IwoniczRally/1.0 material research'}
IDS=['asphalt_04','herringbone_pavement_02','white_plaster_02','grass_ground','roof_slates_02']
SKY='kloofendal_48d_partly_cloudy_puresky'
def get(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=60) as r:return r.read()
def asset(id):
 files=json.loads(get('https://api.polyhaven.com/files/'+id));info=json.loads(get('https://api.polyhaven.com/info/'+id));records=[]
 variants=[('hdri',files['hdri']['1k']['hdr'])] if id==SKY else [(k,files[k]['1k']['jpg']) for k in ['Diffuse','nor_gl','Rough']]
 folder=ROOT/id;folder.mkdir(exist_ok=True)
 for kind,f in variants:
  b=get(f['url']);assert hashlib.md5(b).hexdigest()==f['md5'],f'Checksum mismatch: {id}/{kind}'
  filename=kind+('.hdr' if kind=='hdri' else '.jpg');(folder/filename).write_bytes(b)
  records.append({'kind':kind,'path':str(folder/filename).removeprefix('public/'),'url':f['url'],'bytes':len(b),'md5':f['md5'],'sha256':hashlib.sha256(b).hexdigest()})
 return {'id':id,'page':'https://polyhaven.com/a/'+id,'authors':info.get('authors'),'dimensions':info.get('dimensions'),'scale':info.get('scale'),'license':'CC0-1.0','files':records}
license_page=get('https://polyhaven.com/license').decode();assert 'CC0' in license_page
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 assets=list(pool.map(asset,IDS+[SKY]))
(ROOT/'sources.json').write_text(json.dumps({'provider':'Poly Haven','license':'https://polyhaven.com/license','retrieved':'2026-11-01','assets':assets},ensure_ascii=False,indent=2)+'\n')
print('Verified files:',sum(len(a['files']) for a in assets),'bytes:',sum(f['bytes'] for a in assets for f in a['files']))
