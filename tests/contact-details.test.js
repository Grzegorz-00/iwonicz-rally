import {test} from 'node:test';import assert from 'node:assert/strict';
import {foundationDepth} from '../src/contact-details.js';
test('foundations reach below every footprint corner even on a steep hillside',()=>{
 const points=[[0,0],[20,0],[20,20],[0,20]],height=(x,z)=>x*.3+z*.2,anchor=height(10,10),depth=foundationDepth(points,anchor,height);
 assert.ok(depth>2);for(const [x,z] of points)assert.ok(anchor-depth<height(x,z));assert.equal(foundationDepth(points,0,()=>0),2);
});
