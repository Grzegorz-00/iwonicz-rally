import grid from './data/terrain.json' with {type:'json'};
import map from './data/zdrojowa.json' with {type:'json'};
import {nearestOnLine,pointAt} from './geography.js';
export {grid};
export function rawAltitude(x,z){
 const gx=Math.max(0,Math.min(grid.nx-1.000001,(x-grid.x0)/grid.step)),gz=Math.max(0,Math.min(grid.nz-1.000001,(z-grid.z0)/grid.step));
 const ix=Math.floor(gx),iz=Math.floor(gz),tx=gx-ix,tz=gz-iz,k=iz*grid.nx+ix,h=grid.heights;
 return (h[k]*(1-tx)+h[k+1]*tx)*(1-tz)+(h[k+grid.nx]*(1-tx)+h[k+grid.nx+1]*tx)*tz;
}
const bridges=map.routeWays.filter(w=>w.tags.bridge==='yes').map(w=>{
 const a=nearestOnLine(map.route,...w.points[0]).s,b=nearestOnLine(map.route,...w.points.at(-1)).s;
 const p=pointAt(map.route,Math.max(0,a-5)),q=pointAt(map.route,Math.min(map.length,b+5));
 return {a,b,ha:rawAltitude(p.x,p.z),hb:rawAltitude(q.x,q.z)};
});
export function roadAltitude(s){
 for(const b of bridges)if(s>=b.a&&s<=b.b)return b.ha+(b.hb-b.ha)*(s-b.a)/(b.b-b.a);
 let sum=0;for(const d of [-6,-3,0,3,6]){const p=pointAt(map.route,Math.max(0,Math.min(map.length,s+d)));sum+=rawAltitude(p.x,p.z);}return sum/5;
}
const profile=[];for(let s=0;s<map.length;s+=5)profile.push(roadAltitude(s));profile.push(roadAltitude(map.length));
export function profileAltitude(s){s=Math.max(0,Math.min(map.length,s));const i=Math.min(profile.length-2,Math.floor(s/5)),start=i*5,end=Math.min(map.length,start+5),t=(s-start)/(end-start);return profile[i]*(1-t)+profile[i+1]*t;}
export const datum=roadAltitude(0);
export function altitudeAt(x,z){const near=nearestOnLine(map.route,x,z),raw=rawAltitude(x,z);const t=Math.max(0,Math.min(1,(near.distance-6)/8));const blend=t*t*(3-2*t);return profileAltitude(near.s)*(1-blend)+raw*blend;}
export const heightAt=(x,z)=>altitudeAt(x,z)-datum;
export function roadPose(x,z,heading){const dx=Math.sin(heading),dz=Math.cos(heading),h=heightAt(x,z),grade=(heightAt(x+dx*2,z+dz*2)-heightAt(x-dx*2,z-dz*2))/4,cross=(heightAt(x+dz,z-dx)-heightAt(x-dz,z+dx))/2;return {height:h+.06,grade,pitch:-Math.atan(grade),roll:Math.atan(cross)};}
export function slopeAcceleration(speed,grade,throttle=false,brake=false){if(brake||(!throttle&&Math.abs(speed)<.025))return 0;return -9.81*Math.sin(Math.atan(grade));}
