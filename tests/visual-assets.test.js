import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import refs from '../src/data/facade-references.json' with {type:'json'};
import data from '../src/data/zdrojowa.json' with {type:'json'};
test('every shipped photograph and HDRI matches the provider checksum and recorded provenance',()=>{
 const sources=JSON.parse(readFileSync('public/materials/sources.json','utf8'));assert.equal(sources.assets.length,6);let files=0;
 for(const asset of sources.assets){assert.equal(asset.license,'CC0-1.0');assert.ok(Object.keys(asset.authors).length);for(const f of asset.files){const bytes=readFileSync('public/'+f.path);assert.equal(bytes.length,f.bytes);assert.equal(createHash('md5').update(bytes).digest('hex'),f.md5);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);files++;}}
 assert.equal(files,16);
});
test('street-photo models refer to real, distinct OSM addresses and disclose matching limits',()=>{
 for(const [id,ref] of Object.entries(refs)){const building=data.buildings.find(b=>b.id===id);assert.ok(building,'missing OSM footprint');assert.equal(ref.address,'Zdrojowa '+building.tags['addr:housenumber']);assert.ok(ref.reference&&ref.match);assert.ok(ref.eaves>2&&ref.eaves<15);}
 assert.equal(Object.keys(refs).length,5);
});
