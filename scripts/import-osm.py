#!/usr/bin/env python3
"""Import an OSM API XML extract. Network fetching is deliberately explicit."""
import sys,json,math,xml.etree.ElementTree as ET,collections
from pathlib import Path
root=ET.parse(sys.argv[1]).getroot()
nodes={n.get('id'):n for n in root.findall('node')}
def tags(e):return {t.get('k'):t.get('v') for t in e.findall('tag')}
ways={w.get('id'):w for w in root.findall('way')}
main=[w for w in ways.values() if tags(w).get('name')=='Zdrojowa' and tags(w).get('highway')=='tertiary']
count=collections.Counter(r.get('ref') for w in main for r in [w.findall('nd')[0],w.findall('nd')[-1]])
start=min((r for r,c in count.items() if c==1),key=lambda r:float(nodes[r].get('lat')))
origin=[float(nodes[start].get('lon')),float(nodes[start].get('lat'))]
scale=111319.49079327358;cs=math.cos(math.radians(origin[1]))
def point(ref):
 n=nodes[ref];return [round(-(float(n.get('lon'))-origin[0])*scale*cs,3),round((float(n.get('lat'))-origin[1])*scale,3)]
def refs(w):return [n.get('ref') for n in w.findall('nd')]
route=[];route_ways=[];current=start;remaining=main[:]
while remaining:
 found=next((w for w in remaining if current in (refs(w)[0],refs(w)[-1])),None)
 if found is None:raise ValueError('Disconnected Zdrojowa route')
 rr=refs(found);rev=rr[0]!=current
 if rev:rr=rr[::-1]
 route.extend(rr if not route else rr[1:]);route_ways.append({'id':found.get('id'),'points':[point(r) for r in rr],'tags':tags(found),'reversed':rev});current=rr[-1];remaining.remove(found)
rp=[point(r) for r in route]
def distance(p):
 best=1e9
 for a,b in zip(rp,rp[1:]):
  dx,dz=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz or 1)));best=min(best,math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz))
 return best
data={'origin':origin,'projection':'Local equirectangular metres: X west, Z north; scale at origin latitude','source':{'name':'© OpenStreetMap contributors','url':'https://www.openstreetmap.org/copyright','license':'ODbL-1.0','retrieved':'2026-11-01','bbox':[21.785,49.562,21.801,49.583]},'route':rp,'routeWays':route_ways,'buildings':[],'roads':[],'waterways':[],'landcover':[],'trees':[]}
for wid,w in ways.items():
 t=tags(w);rr=refs(w)
 if not rr or any(r not in nodes for r in rr):continue
 pp=[point(r) for r in rr]
 if min(distance(p) for p in pp)>190:continue
 obj={'id':wid,'points':pp,'tags':t}
 if 'building' in t and rr[0]==rr[-1] and t['building']!='no':data['buildings'].append(obj)
 elif 'highway' in t and w not in main and t['highway'] not in ['steps','proposed','construction']:data['roads'].append(obj)
 elif 'waterway' in t:data['waterways'].append(obj)
 elif t.get('landuse') in ['forest','grass','meadow','residential'] or t.get('natural') in ['wood','scrub','water'] or t.get('leisure')=='park':data['landcover'].append(obj)
for rid,n in nodes.items():
 if tags(n).get('natural')=='tree' and distance(point(rid))<160:data['trees'].append(point(rid))
data['length']=round(sum(math.dist(a,b) for a,b in zip(rp,rp[1:])),2)
Path('src/data').mkdir(exist_ok=True)
serialized=json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n'
Path('src/data/zdrojowa.json').write_text(serialized)
Path('public/data').mkdir(parents=True,exist_ok=True)
Path('public/data/zdrojowa.json').write_text(serialized)
print({k:len(data[k]) for k in ['route','routeWays','buildings','roads','waterways','landcover','trees']},'length',data['length'],'origin',origin)
