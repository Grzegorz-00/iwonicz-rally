// Bicycle steering model. Tight manoeuvres at low speed, calmer steering at speed.
export const WHEELBASE=1.84;
export function steeringAngle(input,speed){return input*.4/(1+Math.abs(speed)*.045);}
export function yawRate(input,speed){return speed*Math.tan(steeringAngle(input,speed))/WHEELBASE;}
// Identical drive resistance on asphalt and grass; no artificial off-road speed penalty.
export function resistance(){return .16;}
