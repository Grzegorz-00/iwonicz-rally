// Bicycle steering model. Tight manoeuvres at low speed, calmer steering at speed.
export const WHEELBASE=1.84;
export function updateSteering(current,target,dt){
 const rate=target===0?2.6:1.5;
 const delta=Math.max(0,dt)*rate;
 return current+Math.max(-delta,Math.min(delta,target-current));
}
export function steeringAngle(input,speed){
 const clamped=Math.max(-1,Math.min(1,input));
 const progressive=Math.sign(clamped)*Math.abs(clamped)**1.5;
 return progressive*.4/(1+Math.abs(speed)**2*.035);
}
export function yawRate(input,speed){return speed*Math.tan(steeringAngle(input,speed))/WHEELBASE;}
// Identical drive resistance on asphalt and grass; no artificial off-road speed penalty.
export function resistance(){return .16;}
