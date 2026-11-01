import {test} from 'node:test';import assert from 'node:assert/strict';
import {steeringAngle,yawRate,resistance,WHEELBASE} from '../src/handling.js';
test('tight low-speed turn and reduced steering at higher speed',()=>{const radius=WHEELBASE/Math.tan(steeringAngle(1,1));assert.ok(radius>4&&radius<5);assert.ok(steeringAngle(1,20)<steeringAngle(1,1));assert.equal(yawRate(0,10),0);assert.ok(yawRate(1,3)>0);assert.ok(yawRate(1,-3)<0);});
test('grass has the same engine/drag speed potential as asphalt',()=>{assert.equal(resistance(true),resistance(false));assert.ok(4.4/resistance(false)>20);});
