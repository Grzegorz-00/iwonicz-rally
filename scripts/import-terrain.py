#!/usr/bin/env python3
"""Convert a GUGiK metric GeoTIFF into the local game grid. Requires rasterio, pyproj, numpy."""
import json,sys,hashlib
from pathlib import Path
import numpy as np
import rasterio
from pyproj import Transformer
osm=json.loads(Path('src/data/zdrojowa.json').read_text());origin=osm['origin'];scale=111319.49079327358;cs=np.cos(np.radians(origin[1]))
x0,z0,step,nx,nz=-650,-350,10,131,211
xx,zz=np.meshgrid(np.arange(nx)*step+x0,np.arange(nz)*step+z0)
lon=origin[0]-xx/(scale*cs);lat=origin[1]+zz/scale
with rasterio.open(sys.argv[1]) as raster:
 arr=raster.read(1);tr=Transformer.from_crs(4326,raster.crs,always_xy=True);ex,ey=tr.transform(lon,lat);inv=~raster.transform
 col=inv.a*ex+inv.b*ey+inv.c-.5;row=inv.d*ex+inv.e*ey+inv.f-.5
 if np.any(col<0) or np.any(row<0) or np.any(col>=raster.width-1) or np.any(row>=raster.height-1):raise ValueError('Requested local grid exceeds source coverage')
 c=col.astype(int);r=row.astype(int);tx=col-c;ty=row-r
 samples=np.stack([arr[r,c],arr[r,c+1],arr[r+1,c],arr[r+1,c+1]])
 if not np.all(np.isfinite(samples)) or (raster.nodata is not None and np.any(samples==raster.nodata)):raise ValueError('Missing elevation samples')
 h=(samples[0]*(1-tx)+samples[1]*tx)*(1-ty)+(samples[2]*(1-tx)+samples[3]*tx)*ty
 if h.min()<200 or h.max()>1000:raise ValueError('Implausible elevation range')
 data={'source':{'name':'GUGiK / Geoportal — NMT GRID1','coverage':'DTM_PL-KRON86-NH_TIFF','url':'https://mapy.geoportal.gov.pl/wss/service/PZGIK/NMT/GRID1/WCS/DigitalTerrainModelFormatTIFF','retrieved':'2026-11-01','verticalDatum':'PL-KRON86-NH','requestResolutionMetres':5,'sourceSHA256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest(),'crs':str(raster.crs),'rasterBounds':list(raster.bounds),'accessConstraints':'none (WCS GetCapabilities)'},'origin':origin,'x0':x0,'z0':z0,'step':step,'nx':nx,'nz':nz,'heights':np.round(h,2).flatten().tolist()}
 for path in ['src/data/terrain.json','public/data/terrain.json']:Path(path).write_text(json.dumps(data,separators=(',',':'))+'\n')
 print('Source',raster.crs,arr.shape,raster.dtypes,'local grid',h.shape,'range',h.min(),h.max())
