import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import data from '../src/data/zdrojowa.json' with {type:'json'};
import {grid,datum,rawAltitude,profileAltitude,heightAt,altitudeAt,roadPose,slopeAcceleration} from '../src/terrain.js';
import {pointAt} from '../src/geography.js';
test('GUGiK height grid is complete, metric, finite and published unchanged',()=>{
 assert.equal(grid.source.crs,'EPSG:2180');assert.equal(grid.source.verticalDatum,'PL-KRON86-NH');assert.equal(grid.heights.length,grid.nx*grid.nz);assert.ok(grid.heights.every(h=>Number.isFinite(h)&&h>300&&h<500));
 assert.equal(readFileSync('public/data/terrain.json','utf8'),readFileSync('src/data/terrain.json','utf8'));
 assert.equal(rawAltitude(grid.x0,grid.z0),grid.heights[0]);
 const mid=rawAltitude(grid.x0+grid.step/2,grid.z0+grid.step/2);assert.ok(Math.abs(mid-(grid.heights[0]+grid.heights[1]+grid.heights[grid.nx]+grid.heights[grid.nx+1])/4)<1e-6);
});
test('measured road drops about 25 metres without artificial exaggeration or steps',()=>{
 assert.ok(datum>380&&datum<386);const drop=profileAltitude(0)-profileAltitude(data.length);assert.ok(drop>23&&drop<27);
 let previous=profileAltitude(0);for(let s=.5;s<data.length;s+=.5){const h=profileAltitude(s);assert.ok(Math.abs(h-previous)<.12);previous=h;}
});
test('car contact height, pitch and slope reverse with travel direction',()=>{
 const p=pointAt(data.route,30),pose=roadPose(p.x,p.z,p.heading),opposite=roadPose(p.x,p.z,p.heading+Math.PI);
 assert.ok(Math.abs(pose.grade)>.005);assert.ok(Math.abs(pose.grade+opposite.grade)<1e-10);assert.equal(pose.height,heightAt(p.x,p.z)+.06);assert.ok(Math.abs(pose.pitch+Math.atan(pose.grade))<1e-10);
 assert.ok(Math.abs(altitudeAt(p.x,p.z)-datum-heightAt(p.x,p.z))<1e-10);
});
test('gravity slows climbs, accelerates descents and respects stationary brake',()=>{
 assert.ok(slopeAcceleration(5,.1,true)<0);assert.ok(slopeAcceleration(5,-.1,true)>0);assert.equal(slopeAcceleration(0,.1,false),0);assert.equal(slopeAcceleration(5,.1,true,true),0);
});
