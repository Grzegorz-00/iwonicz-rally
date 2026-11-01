import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nearestOnLine, pointAt, insidePolygon, geographicPosition } from '../src/geography.js';
const data=JSON.parse(readFileSync(new URL('../src/data/zdrojowa.json',import.meta.url)));
test('OSM street chain connects Aleja Słoneczna to Długa with unscaled metric length',()=>{
 assert.equal(data.routeWays.length,10);
 assert.ok(data.length>1300&&data.length<1400);
 let length=0;
 for(let i=1;i<data.route.length;i++){const step=Math.hypot(data.route[i][0]-data.route[i-1][0],data.route[i][1]-data.route[i-1][1]);assert.ok(step>0&&step<100);length+=step;}
 assert.ok(Math.abs(length-data.length)<.01);
 for(let i=1;i<data.routeWays.length;i++)assert.deepEqual(data.routeWays[i-1].points.at(-1),data.routeWays[i].points[0]);
 const south=geographicPosition(data.origin,...data.route[0]),north=geographicPosition(data.origin,...data.route.at(-1));
 assert.ok(Math.abs(south.lat-49.5659871)<.000001);assert.ok(Math.abs(north.lat-49.5778285)<.000001);assert.ok(Math.abs(north.lon-21.7948911)<.000001);
});
test('projection and nearest road handle sideways bends and return correct station',()=>{
 const line=[[0,0],[0,10],[10,10],[10,20]];
 assert.deepEqual(pointAt(line,15),{x:5,z:10,heading:Math.PI/2});
 const p=nearestOnLine(line,5,12);assert.equal(p.distance,2);assert.equal(p.s,15);
 assert.equal(nearestOnLine(line,11,15).distance,1);
 for(let s=0;s<data.length;s+=7){const p=pointAt(data.route,s);assert.ok(nearestOnLine(data.route,p.x,p.z).distance<.00001);}
});
test('concave building collision does not fill courtyards using bounding boxes',()=>{
 const polygon=[[0,0],[10,0],[10,3],[3,3],[3,10],[0,10],[0,0]];
 assert.equal(insidePolygon(polygon,2,8),true);assert.equal(insidePolygon(polygon,8,8),false);
});
test('real bridges, unmarked carriageway and attributed footprint data are retained',()=>{
 assert.equal(data.routeWays.filter(w=>w.tags.bridge==='yes').length,2);
 assert.ok(data.routeWays.every(w=>w.tags.lane_markings==='no'));
 assert.ok(data.waterways.some(w=>w.tags.name==='Iwoniczanka'));
 assert.ok(data.buildings.length>100);assert.ok(data.buildings.every(b=>b.points.length>=4&&b.points[0][0]===b.points.at(-1)[0]&&b.points[0][1]===b.points.at(-1)[1]));assert.equal(data.source.license,'ODbL-1.0');
});

test('downloadable ODbL database matches geometry bundled in the game',()=>{assert.equal(readFileSync(new URL('../public/data/zdrojowa.json',import.meta.url),'utf8'),readFileSync(new URL('../src/data/zdrojowa.json',import.meta.url),'utf8'));});
