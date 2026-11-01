import {test} from 'node:test';import assert from 'node:assert/strict';
import {updateSteering,steeringAngle,yawRate,resistance,WHEELBASE} from '../src/handling.js';
test('tight low-speed turn and reduced steering at higher speed',()=>{const radius=WHEELBASE/Math.tan(steeringAngle(1,1));assert.ok(radius>4&&radius<5);assert.ok(steeringAngle(1,20)<steeringAngle(1,1));assert.equal(yawRate(0,10),0);assert.ok(yawRate(1,3)>0);assert.ok(yawRate(1,-3)<0);});
test('grass has the same engine/drag speed potential as asphalt',()=>{assert.equal(resistance(true),resistance(false));assert.ok(4.4/resistance(false)>20);});

test('short taps build steering gradually and reversal passes through centre',()=>{
 const tapped=updateSteering(0,1,.1);assert.ok(tapped>0&&tapped<.2);
 assert.ok(steeringAngle(tapped,10)<steeringAngle(1,10)*.1);
 assert.ok(updateSteering(.8,-1,.1)>0);
 let value=0;for(let i=0;i<60;i++)value=updateSteering(value,1,1/60);assert.equal(value,1);
 for(let i=0;i<30;i++)value=updateSteering(value,0,1/60);assert.equal(value,0);
});
test('steering response is independent of frame rate and calmer at road speed',()=>{
 let fast=0,slow=0;for(let i=0;i<30;i++)fast=updateSteering(fast,1,1/60);for(let i=0;i<10;i++)slow=updateSteering(slow,1,.05);assert.ok(Math.abs(fast-slow)<1e-10);
 assert.ok(Math.abs(yawRate(1,20))<.35);assert.ok(Math.abs(yawRate(1,10))<.6);
});
